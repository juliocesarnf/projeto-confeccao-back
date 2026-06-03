import { db } from "../database/db.js";
import { ReportRepository } from "./report.repository.js";
import type { LowMaterialStockOptions, LowMaterialStockRow } from "../types/MaterialTypes.js";

const TYPE = "low_material_stock";
const ENTITY_TYPE = "material_variation";
const reportRepository = new ReportRepository();

export async function checkLowMaterialStock(options: LowMaterialStockOptions) {
  const weeks = options.lookbackDays / 7;

  const result = await db.query<LowMaterialStockRow>(
    `
    WITH material_usage AS (
      SELECT
        pm.material_variation_id,
        COALESCE(SUM(oi.quantity * pm.quantity), 0)::numeric AS total_quantity
      FROM order_item oi
      JOIN customer_order co ON co.id = oi.order_id
      JOIN product_material pm ON pm.product_variation_id = oi.product_variation_id
      WHERE co.created_at >= NOW() - ($1::int * INTERVAL '1 day')
        AND co.status <> 'cancelado'
      GROUP BY pm.material_variation_id
    ),
    material_stock AS (
      SELECT
        mv.id,
        m.name AS "materialName",
        mv.variation,
        m.base_unit AS "baseUnit",
        mv.stock,
        COALESCE(mu.total_quantity, 0)::numeric AS "totalQuantity",
        (COALESCE(mu.total_quantity, 0)::numeric / $2::numeric) AS "weeklyUsage",
        ((COALESCE(mu.total_quantity, 0)::numeric / $2::numeric) * $3::numeric) AS "recommendedMinimum"
      FROM material_variation mv
      JOIN material m ON m.id = mv.material_id
      LEFT JOIN material_usage mu ON mu.material_variation_id = mv.id
    )
    SELECT *
    FROM material_stock
    WHERE stock <= "recommendedMinimum"
      AND "recommendedMinimum" > 0
    ORDER BY "materialName", variation
    `,
    [options.lookbackDays, weeks, options.coverageWeeks]
  );

  const lowStockIds = result.rows.map((row) => row.id);

  for (const row of result.rows) {
    await createReport(row, options);
  }

  await reportRepository.resolveRecovered(TYPE, ENTITY_TYPE, lowStockIds);

  return result.rows;
}

async function createReport(
  row: LowMaterialStockRow,
  options: LowMaterialStockOptions
) {
  const variationName = [row.materialName, row.variation].filter(Boolean).join(" - ");
  const unit = row.baseUnit ? ` ${row.baseUnit}` : "";

  const metadata = {
    displayName: variationName,
    currentStock: Number(row.stock),
    totalQuantity: Number(row.totalQuantity),
    weeklyUsage: Number(row.weeklyUsage),
    recommendedMinimum: Number(row.recommendedMinimum),
    coverageWeeks: options.coverageWeeks,
    periodDays: options.lookbackDays,
    baseUnit: row.baseUnit,
  };

  await reportRepository.createIfMissing({
    type: TYPE,
    title: "Estoque baixo de material",
    message: `A variacao ${variationName} esta com ${formatNumber(row.stock)}${unit} em estoque. Recomendado: ${formatNumber(row.recommendedMinimum)}${unit}. Consumo semanal medio: ${formatNumber(row.weeklyUsage)}${unit}.`,
    severity: "warning",
    entityType: ENTITY_TYPE,
    entityId: row.id,
    metadata,
  });
}

function formatNumber(value: string) {
  return Number(value).toFixed(2);
}
