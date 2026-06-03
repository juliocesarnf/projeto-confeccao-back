import { db } from "../database/db.js";
import { ReportRepository } from "./report.repository.js";
import type { ProductionDelayRiskOptions, ProductionDelayRiskRow } from "../types/ProductionTypes.js";

const TYPE = "production_delay_risk";
const ENTITY_TYPE = "production";
const reportRepository = new ReportRepository();

export async function checkProductionDelayRisk(options: ProductionDelayRiskOptions) {
  const result = await db.query<ProductionDelayRiskRow>(
    `
    WITH batch_difficulty AS (
      SELECT
        pb.production_id,
        pb.id AS batch_id,
        SUM(pbi.quantity * COALESCE(pp.dificulty_level, 1))::int AS batch_difficulty
      FROM production_batch pb
      JOIN production_batch_item pbi ON pbi.production_batch_id = pb.id
      JOIN production_item pi ON pi.id = pbi.production_item_id
      JOIN product_variation pv ON pv.id = pi.product_variation_id
      LEFT JOIN product_process pp
        ON pp.product_id = pv.product_id
        AND pp.process_id = pb.process_id
      WHERE pb.completed = FALSE
      GROUP BY pb.production_id, pb.id
    ),
    production_remaining AS (
      SELECT
        pr.id AS production_id,
        co.id AS order_id,
        co.due_date,
        c.name AS customer_name,
        COALESCE(SUM(bd.batch_difficulty), 0)::int AS remaining_difficulty,
        COUNT(bd.batch_id)::int AS remaining_batches,
        (
          SELECT COUNT(*) FROM production_batch pb2 WHERE pb2.production_id = pr.id
        )::int AS total_batches
      FROM production pr
      JOIN customer_order co ON co.id = pr.order_id
      JOIN customer c ON c.id = co.customer_id
      LEFT JOIN batch_difficulty bd ON bd.production_id = pr.id
      WHERE pr.status IN ('planejado', 'aguardando_material', 'em_andamento', 'pausado')
        AND co.due_date IS NOT NULL
        AND co.status NOT IN ('finalizado', 'cancelado')
      GROUP BY pr.id, co.id, co.due_date, c.name
    )
    SELECT
      production_id,
      order_id,
      due_date,
      customer_name,
      remaining_difficulty,
      remaining_batches,
      total_batches,
      (NOW() + (remaining_difficulty * ($1::numeric / 50.0) * INTERVAL '1 minute')) AS estimated_completion,
      EXTRACT(EPOCH FROM (
        due_date::timestamp - (NOW() + (remaining_difficulty * ($1::numeric / 50.0) * INTERVAL '1 minute'))
      )) / 86400.0 AS days_slack
    FROM production_remaining
    WHERE (NOW() + (remaining_difficulty * ($1::numeric / 50.0) * INTERVAL '1 minute')) > due_date::timestamp
    ORDER BY days_slack ASC
    `,
    [options.minutesPer50Units]
  );

  const atRiskIds = result.rows.map((row) => row.production_id);

  for (const row of result.rows) {
    await createReport(row, options);
  }

  await reportRepository.resolveRecovered(TYPE, ENTITY_TYPE, atRiskIds);

  return result.rows;
}

function computeSeverity(daysSlack: number): "warning" | "critical" {
  // Mais de 1 dia de atraso estimado → crítico
  return daysSlack > -1 ? "warning" : "critical";
}

async function createReport(row: ProductionDelayRiskRow, options: ProductionDelayRiskOptions) {
  const daysSlack = Number(row.days_slack);
  const severity = computeSeverity(daysSlack);
  const delayDays = Math.abs(daysSlack).toFixed(1);
  const completionDate = new Date(row.estimated_completion).toLocaleDateString("pt-BR");
  const dueDate = new Date(row.due_date).toLocaleDateString("pt-BR");

  const metadata = {
    orderId: row.order_id,
    customerName: row.customer_name,
    dueDate: row.due_date,
    estimatedCompletion: row.estimated_completion,
    daysSlack,
    remainingDifficulty: row.remaining_difficulty,
    remainingBatches: row.remaining_batches,
    totalBatches: row.total_batches,
    minutesPer50Units: options.minutesPer50Units,
  };

  const baseMsg = `Producao #${row.production_id} (pedido #${row.order_id} - ${row.customer_name}). Conclusao estimada: ${completionDate}. Prazo: ${dueDate}. Atraso estimado: ${delayDays} dias. Lotes pendentes: ${row.remaining_batches}/${row.total_batches}.`;
  const message =
    severity === "critical"
      ? `Risco critico de atraso. ${baseMsg}`
      : `Possivel atraso na entrega. ${baseMsg}`;

  await reportRepository.createIfMissing({
    type: TYPE,
    title: "Risco de atraso na producao",
    message,
    severity,
    entityType: ENTITY_TYPE,
    entityId: row.production_id,
    metadata,
  });
}
