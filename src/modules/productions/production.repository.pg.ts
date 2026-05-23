import type { PoolClient } from "pg";
import { db } from "../../database/db.js";
import type { ProductionRepositoryInterface } from "./production.repository.intreface.js";
import type {
  CreateProductionInput,
  CreatedProduction,
  CreatedProductionBatch,
  CreatedProductionBatchItem,
  CreatedProductionBatchWorker,
  CreatedProductionItem,
  OrderItemView,
  ProductionDetailView,
} from "../../types/production.js";

export class ProductionRepositoryPg implements ProductionRepositoryInterface {
  async getAllProductions(): Promise<any[]> {
    const result = await db.query(`
      SELECT
        p.id,
        p.order_id AS "orderId",
        p.status,
        p.start_date AS "startDate",
        p.expect_dificulty AS "expectDificulty",
        p.expect_end_date AS "expectedEndDate",
        p.end_date AS "endDate"
      FROM production p
      ORDER BY p.id DESC
    `);

    return result.rows;
  }

  async createProduction(data: CreateProductionInput): Promise<CreatedProduction> {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const expectDificulty = await this.calculateExpectedDificulty(client, data);
      const production = await this.insertProduction(client, data.orderId, expectDificulty);
      const productionItems = await this.insertProductionItems(client, production.id, data.items);
      const itemByVariationId = new Map(
        productionItems.map(item => [item.productVariationId, item])
      );

      const batches: CreatedProductionBatch[] = [];

      for (const batchInput of data.batches) {
        const batchResult = await client.query(`
          INSERT INTO production_batch (
            production_id,
            process_id,
            step_order,
            status
          )
          VALUES ($1, $2, $3, 'planejado')
          RETURNING
            id,
            process_id AS "processId",
            step_order AS "stepOrder",
            status
        `, [production.id, batchInput.processId, batchInput.stepOrder]);

        const batch = batchResult.rows[0] as {
          id: number;
          processId: number;
          stepOrder: number;
          status: string;
        };

        const batchItems: CreatedProductionBatchItem[] = [];

        for (const itemInput of batchInput.items) {
          const productionItem = itemByVariationId.get(itemInput.productVariationId);

          if (!productionItem) {
            throw new Error(
              `Variação ${itemInput.productVariationId} não existe nos itens da produção.`
            );
          }

          const batchItemResult = await client.query(`
            INSERT INTO production_batch_item (
              production_batch_id,
              production_item_id,
              quantity
            )
            VALUES ($1, $2, $3)
            RETURNING id, production_item_id AS "productionItemId", quantity
          `, [batch.id, productionItem.id, itemInput.quantity]);

          batchItems.push({
            ...batchItemResult.rows[0],
            productVariationId: productionItem.productVariationId,
          });
        }

        const workers: CreatedProductionBatchWorker[] = [];

        for (const workerId of batchInput.workers) {
          const workerResult = await client.query(`
            INSERT INTO production_batch_worker (
              production_batch_id,
              worker_id
            )
            VALUES ($1, $2)
            RETURNING id, worker_id AS "workerId"
          `, [batch.id, workerId]);

          workers.push(workerResult.rows[0]);
        }

        batches.push({
          id: batch.id,
          processId: batch.processId,
          stepOrder: batch.stepOrder,
          status: batch.status,
          items: batchItems,
          workers,
        });
      }

      await this.setOrderInProduction(client, data.orderId);
      await client.query("COMMIT");

      return {
        ...production,
        items: productionItems,
        batches,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private async insertProduction(
    client: PoolClient,
    orderId: number,
    expectDificulty: number
  ) {
    const result = await client.query(`
      INSERT INTO production (
        order_id,
        status,
        start_date,
        expect_dificulty
      )
      VALUES ($1, 'planejado', NOW(), $2)
      RETURNING
        id,
        order_id AS "orderId",
        status,
        start_date AS "startDate",
        expect_dificulty AS "expectDificulty",
        expect_end_date AS "expectedEndDate",
        end_date AS "endDate"
    `, [orderId, expectDificulty]);

    return result.rows[0] as Omit<CreatedProduction, "items" | "batches">;
  }

  private async calculateExpectedDificulty(
    client: PoolClient,
    data: CreateProductionInput
  ): Promise<number> {
    const variationIds = [...new Set(
      data.batches.flatMap(batch => batch.items.map(item => item.productVariationId))
    )];
    const processIds = [...new Set(data.batches.map(batch => batch.processId))];

    const result = await client.query(`
      SELECT
        pv.id AS "productVariationId",
        pp.process_id AS "processId",
        pp.dificulty_level AS "dificultyLevel"
      FROM product_variation pv
      JOIN product_process pp ON pp.product_id = pv.product_id
      WHERE pv.id = ANY($1::int[])
        AND pp.process_id = ANY($2::int[])
    `, [variationIds, processIds]);

    const dificultyByVariationAndProcess = new Map<string, number | null>();

    for (const row of result.rows) {
      dificultyByVariationAndProcess.set(
        this.getDificultyKey(row.productVariationId, row.processId),
        row.dificultyLevel
      );
    }

    const total = data.batches.reduce((productionTotal, batch) => {
      const workerCount = new Set(batch.workers).size;

      const batchTotal = batch.items.reduce((itemsTotal, item) => {
        const key = this.getDificultyKey(item.productVariationId, batch.processId);
        const dificultyLevel = dificultyByVariationAndProcess.get(key);

        if (dificultyLevel == null) {
          throw new Error(
            `Dificuldade nao cadastrada para a variacao ${item.productVariationId} no processo ${batch.processId}.`
          );
        }

        return itemsTotal + ((item.quantity * dificultyLevel) / workerCount);
      }, 0);

      return productionTotal + batchTotal;
    }, 0);

    return Math.ceil(total);
  }

  private getDificultyKey(productVariationId: number, processId: number) {
    return `${productVariationId}:${processId}`;
  }

  private async insertProductionItems(
    client: PoolClient,
    productionId: number,
    items: CreateProductionInput["items"]
  ) {
    const productionItems: CreatedProductionItem[] = [];

    for (const item of items) {
      const result = await client.query(`
        INSERT INTO production_item (
          production_id,
          order_item_id,
          product_variation_id,
          planned_quantity,
          status
        )
        VALUES ($1, $2, $3, $4, 'pendente')
        RETURNING
          id,
          order_item_id AS "orderItemId",
          product_variation_id AS "productVariationId",
          planned_quantity AS "plannedQuantity",
          produced_quantity AS "producedQuantity",
          status
      `, [
        productionId,
        item.orderItemId,
        item.productVariationId,
        item.plannedQuantity,
      ]);

      productionItems.push(result.rows[0]);
    }

    return productionItems;
  }

  private async setOrderInProduction(client: PoolClient, orderId: number) {
    await client.query(`
      UPDATE customer_order
      SET status = 'producao'
      WHERE id = $1
    `, [orderId]);
  }

  async fulfillItems(orderId: number, itemIds: number[]): Promise<void> {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const orderItemsResult = await client.query(`
        UPDATE order_item
        SET
          fulfilled_quantity = quantity,
          status = 'atendido'
        WHERE order_id = $1
          AND id = ANY($2::int[])
        RETURNING id
      `, [orderId, itemIds]);

      if ((orderItemsResult.rowCount ?? 0) !== itemIds.length) {
        throw new Error("Um ou mais itemIds nao pertencem ao pedido informado.");
      }

      await client.query(`
        UPDATE production_item pi
        SET
          produced_quantity = planned_quantity,
          status = 'concluido'
        FROM production p
        WHERE pi.production_id = p.id
          AND p.order_id = $1
          AND pi.order_item_id = ANY($2::int[])
      `, [orderId, itemIds]);

      await client.query(`
        UPDATE customer_order
        SET status = 'confirmado'
        WHERE id = $1
          AND NOT EXISTS (
            SELECT 1
            FROM order_item
            WHERE order_id = $1
              AND status <> 'atendido'
          )
      `, [orderId]);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getProductionById(id: number): Promise<ProductionDetailView | null> {
    const productionResult = await db.query(`
      SELECT
        p.id                      AS "productionId",
        p.status                  AS "productionStatus",
        co.id                     AS "orderId",
        co.customer_id            AS "customerId",
        c.name                    AS "customerName",
        co.due_date               AS "dueDate",
        co.created_at             AS "createdAt",
        co.total_value            AS "totalValue",
        co.status                 AS "orderStatus"
      FROM production p
      JOIN customer_order co ON co.id = p.order_id
      JOIN customer c ON c.id = co.customer_id
      WHERE p.order_id = $1
    `, [id]);

    if (productionResult.rows.length === 0) return null;

    const first = productionResult.rows[0];

    const itemsResult = await db.query(`
      SELECT
        oi.id                     AS "orderItemId",
        oi.product_variation_id   AS "productVariationId",
        oi.quantity               AS "quantity",
        oi.fulfilled_quantity     AS "fulfilledQuantity",
        oi.status                 AS "itemStatus",
        pr.name                   AS "productName",
        pv.sku                    AS "variationSku"
      FROM order_item oi
      JOIN product_variation pv ON pv.id = oi.product_variation_id
      JOIN product pr ON pr.id = pv.product_id
      WHERE oi.order_id = $1
    `, [first.orderId]);

    const allItems: OrderItemView[] = itemsResult.rows.map(row => ({
      orderItemId:        row.orderItemId,
      productVariationId: row.productVariationId,
      productName:        row.productName,
      variationSku:       row.variationSku,
      quantity:           row.quantity,
      fulfilledQuantity:  row.fulfilledQuantity,
      status:             row.itemStatus,
    }));

    const fulfilled = allItems.filter(i => i.status === "atendido");
    const pending   = allItems.filter(i => i.status !== "atendido");

    return {
      order: {
        id:           first.orderId,
        customerId:   first.customerId,
        customerName: first.customerName,
        dueDate:      first.dueDate,
        createdAt:    first.createdAt,
        totalValue:   first.totalValue,
        status:       first.orderStatus,
      },
      progress: {
        total:      allItems.length,
        fulfilled:  fulfilled.length,
        percentage: allItems.length > 0
          ? Math.round((fulfilled.length / allItems.length) * 100)
          : 0,
      },
      items: { fulfilled, pending },
    };
  }
}
