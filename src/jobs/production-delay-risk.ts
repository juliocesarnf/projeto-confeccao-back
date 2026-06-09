import { db } from "../database/db.js";
import { ReportRepository } from "./report.repository.js";
import type {
  ProductionDelayRiskOptions,
  ProductionStaticRiskRow,
  ProductionDynamicRiskRow,
} from "../types/ProductionTypes.js";

const TYPE_STATIC = "production_end_date_risk";
const TYPE_DYNAMIC = "production_remaining_risk";
const ENTITY_TYPE = "production";
const reportRepository = new ReportRepository();

export async function checkProductionDelayRisk(_options: ProductionDelayRiskOptions): Promise<number[]> {
  const [staticIds, dynamicIds] = await Promise.all([
    checkStaticEndDateRisk(),
    checkDynamicRemainingRisk(),
  ]);

  return [...new Set([...staticIds, ...dynamicIds])];
}

async function checkStaticEndDateRisk(): Promise<number[]> {
  const result = await db.query<ProductionStaticRiskRow>(`
    SELECT
      p.id        AS production_id,
      co.id       AS order_id,
      co.due_date,
      c.name      AS customer_name,
      p.expect_end_date,
      p.expect_dificulty,
      (p.expect_end_date::date - co.due_date)::int AS days_over
    FROM production p
    JOIN customer_order co ON co.id = p.order_id
    JOIN customer c ON c.id = co.customer_id
    WHERE p.status IN ('planejado', 'aguardando_material', 'em_andamento', 'pausado')
      AND co.due_date IS NOT NULL
      AND co.status NOT IN ('finalizado', 'cancelado')
      AND p.expect_end_date IS NOT NULL
      AND p.expect_end_date::date >= co.due_date
    ORDER BY days_over DESC
  `);

  const atRiskIds = result.rows.map((row) => row.production_id);

  for (const row of result.rows) {
    await createStaticReport(row);
  }

  await reportRepository.deleteRecovered(TYPE_STATIC, ENTITY_TYPE, atRiskIds);

  return atRiskIds;
}

async function checkDynamicRemainingRisk(): Promise<number[]> {
  const result = await db.query<ProductionDynamicRiskRow>(`
    WITH batch_item_sums AS (
      SELECT
        pb.id             AS batch_id,
        pb.production_id,
        SUM(pbi.quantity::numeric * COALESCE(pp.dificulty_level, 1)) AS items_difficulty
      FROM production_batch pb
      JOIN production_batch_item pbi ON pbi.production_batch_id = pb.id
      JOIN production_item pi        ON pi.id = pbi.production_item_id
      JOIN product_variation pv      ON pv.id = pi.product_variation_id
      LEFT JOIN product_process pp
        ON pp.product_id = pv.product_id
        AND pp.process_id = pb.process_id
      WHERE pb.completed = FALSE
      GROUP BY pb.id, pb.production_id
    ),
    batch_worker_counts AS (
      SELECT
        pbw.production_batch_id AS batch_id,
        COUNT(DISTINCT pbw.worker_id) AS worker_count
      FROM production_batch_worker pbw
      JOIN production_batch pb ON pb.id = pbw.production_batch_id
      WHERE pb.completed = FALSE
      GROUP BY pbw.production_batch_id
    ),
    batch_difficulty AS (
      SELECT
        bis.production_id,
        bis.batch_id,
        bis.items_difficulty / GREATEST(COALESCE(bwc.worker_count, 0), 1) AS difficulty
      FROM batch_item_sums bis
      LEFT JOIN batch_worker_counts bwc ON bwc.batch_id = bis.batch_id
    ),
    production_estimated AS (
      SELECT
        p.id        AS production_id,
        co.id       AS order_id,
        co.due_date,
        c.name      AS customer_name,
        COALESCE(SUM(bd.difficulty), 0)                                            AS remaining_difficulty,
        CEIL(COALESCE(SUM(bd.difficulty), 0) * 1.15)::int                         AS remaining_with_margin,
        COUNT(bd.batch_id)::int                                                    AS remaining_batches,
        (SELECT COUNT(*) FROM production_batch pb2
          WHERE pb2.production_id = p.id)::int                                     AS total_batches,
        (CURRENT_DATE + 1
          + CEIL(CEIL(COALESCE(SUM(bd.difficulty), 0) * 1.15) / 1600.0)::int
        )                                                                           AS estimated_end_date
      FROM production p
      JOIN customer_order co ON co.id = p.order_id
      JOIN customer c        ON c.id = co.customer_id
      LEFT JOIN batch_difficulty bd ON bd.production_id = p.id
      WHERE p.status IN ('planejado', 'aguardando_material', 'em_andamento', 'pausado')
        AND co.due_date IS NOT NULL
        AND co.status NOT IN ('finalizado', 'cancelado')
      GROUP BY p.id, co.id, co.due_date, c.name
    )
    SELECT
      production_id,
      order_id,
      due_date,
      customer_name,
      remaining_difficulty,
      remaining_with_margin,
      remaining_batches,
      total_batches,
      estimated_end_date,
      (estimated_end_date - due_date)::int AS days_over
    FROM production_estimated
    WHERE estimated_end_date >= due_date
    ORDER BY days_over DESC
  `);

  const atRiskIds = result.rows.map((row) => row.production_id);

  for (const row of result.rows) {
    await createDynamicReport(row);
  }

  await reportRepository.deleteRecovered(TYPE_DYNAMIC, ENTITY_TYPE, atRiskIds);

  return atRiskIds;
}

function computeSeverity(daysOver: number): "warning" | "critical" {
  return daysOver === 0 ? "warning" : "critical";
}

async function createStaticReport(row: ProductionStaticRiskRow) {
  const daysOver = Number(row.days_over);
  const severity = computeSeverity(daysOver);
  const endDate = new Date(row.expect_end_date).toLocaleDateString("pt-BR");
  const dueDate = new Date(row.due_date).toLocaleDateString("pt-BR");

  const overlap = daysOver === 0
    ? `coincide com o prazo ${dueDate}`
    : `supera em ${daysOver} dia(s) o prazo ${dueDate}`;

  const message = `Producao #${row.production_id} (pedido #${row.order_id} - ${row.customer_name}): data prevista de conclusao ${endDate} ${overlap}.`;

  await reportRepository.upsertReport({
    type: TYPE_STATIC,
    title: "Data prevista ultrapassa o prazo",
    message,
    severity,
    entityType: ENTITY_TYPE,
    entityId: row.production_id,
    metadata: {
      orderId: row.order_id,
      customerName: row.customer_name,
      dueDate: row.due_date,
      expectEndDate: row.expect_end_date,
      expectDificulty: row.expect_dificulty,
      daysOver,
    },
  });
}

async function createDynamicReport(row: ProductionDynamicRiskRow) {
  const daysOver = Number(row.days_over);
  const severity = computeSeverity(daysOver);
  const estimatedDate = new Date(row.estimated_end_date).toLocaleDateString("pt-BR");
  const dueDate = new Date(row.due_date).toLocaleDateString("pt-BR");

  const overlap = daysOver === 0
    ? `coincide com o prazo ${dueDate}`
    : `supera em ${daysOver} dia(s) o prazo ${dueDate}`;

  const message = `Producao #${row.production_id} (pedido #${row.order_id} - ${row.customer_name}): com base nas etapas restantes (${row.remaining_batches}/${row.total_batches} lotes), conclusao estimada em ${estimatedDate} ${overlap}.`;

  await reportRepository.upsertReport({
    type: TYPE_DYNAMIC,
    title: "Risco de atraso com base nas etapas restantes",
    message,
    severity,
    entityType: ENTITY_TYPE,
    entityId: row.production_id,
    metadata: {
      orderId: row.order_id,
      customerName: row.customer_name,
      dueDate: row.due_date,
      estimatedEndDate: row.estimated_end_date,
      remainingDifficulty: row.remaining_difficulty,
      remainingWithMargin: row.remaining_with_margin,
      remainingBatches: row.remaining_batches,
      totalBatches: row.total_batches,
      daysOver,
    },
  });
}
