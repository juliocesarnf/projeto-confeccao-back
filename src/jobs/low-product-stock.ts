import { db } from "../database/db.js";
import { ReportRepository } from "./report.repository.js";
import type { LowProductStockOptions, LowProductStockRow } from "../types/ProductTypes.js";

const TYPE = "low_product_stock";
const ENTITY_TYPE = "product_variation";
const reportRepository = new ReportRepository();

export async function checkLowProductStock(options: LowProductStockOptions) {
  const weeks = options.lookbackDays / 7;

  const result = await db.query<LowProductStockRow>(
    `
    WITH product_usage AS (
      SELECT
        oi.product_variation_id,
        COALESCE(SUM(oi.quantity), 0)::numeric AS total_quantity
      FROM order_item oi
      JOIN customer_order co ON co.id = oi.order_id
      WHERE co.created_at >= NOW() - ($1::int * INTERVAL '1 day')
        AND co.status <> 'cancelado'
      GROUP BY oi.product_variation_id
    ),
    product_stock AS (
      SELECT
        pv.id,
        p.name AS "productName",
        pv.sku,
        pv.size,
        pv.color,
        pv.stock,
        pv.minimum_stock AS "minimumStock",
        COALESCE(pu.total_quantity, 0)::numeric AS "totalQuantity",
        (COALESCE(pu.total_quantity, 0)::numeric / $2::numeric) AS "weeklyUsage",
        GREATEST(
          pv.minimum_stock,
          (COALESCE(pu.total_quantity, 0)::numeric / $2::numeric) * $3::numeric
        ) AS "recommendedMinimum"
      FROM product_variation pv
      JOIN product p ON p.id = pv.product_id
      LEFT JOIN product_usage pu ON pu.product_variation_id = pv.id
      WHERE pv.active = true
    )
    SELECT *
    FROM product_stock
    WHERE stock <= "recommendedMinimum"
      AND "recommendedMinimum" > 0
    ORDER BY "productName", color, size
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
  row: LowProductStockRow,
  options: LowProductStockOptions
) {
  const variationName = [row.productName, row.color, row.size, row.sku]
    .filter(Boolean)
    .join(" - ");

  const metadata = {
    displayName: variationName,
    currentStock: Number(row.stock),
    minimumStock: Number(row.minimumStock),
    totalQuantity: Number(row.totalQuantity),
    weeklyUsage: Number(row.weeklyUsage),
    recommendedMinimum: Number(row.recommendedMinimum),
    coverageWeeks: options.coverageWeeks,
    periodDays: options.lookbackDays,
  };

  await reportRepository.createIfMissing({
    type: TYPE,
    title: "Estoque baixo de produto",
    message: `A variacao ${variationName} esta com ${formatNumber(row.stock)} em estoque. Recomendado: ${formatNumber(row.recommendedMinimum)}. Consumo semanal medio: ${formatNumber(row.weeklyUsage)}.`,
    severity: "warning",
    entityType: ENTITY_TYPE,
    entityId: row.id,
    metadata,
  });
}

function formatNumber(value: string) {
  return Number(value).toFixed(2);
}
