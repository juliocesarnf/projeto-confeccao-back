import type { OrderRepositoryInterface } from "./order.repository.interface.js";
import type { Order, OrderItem, ConfirmedOrder, CreateOrderInput } from "../../types/OrderTypes.js";
import { db } from "../../database/db.js";

export class OrderRepositoryPg implements OrderRepositoryInterface {

  async getDoneOrders(): Promise<Order[]> {
    const result = await db.query(`
      SELECT 
        co.id,
        co.created_at AS "createdAt",
        co.status,
        co.total_value AS "totalValue",
        co.due_date AS "dueDate",
        co.enough_items AS "enoughItems",
        co.ml_order_id IS NOT NULL AS "isFromMl",

        c.name AS "customerName",

        COUNT(oi.id) AS "totalItems",
        COALESCE(SUM(oi.quantity), 0) AS "totalQuantity"

      FROM customer_order co
      JOIN customer c ON c.id = co.customer_id
      LEFT JOIN order_item oi ON oi.order_id = co.id

      WHERE co.status = 'finalizado'

      GROUP BY co.id, c.name
      ORDER BY co.created_at DESC
    `);

    return result.rows;
  }

  async getProgressOrders(): Promise<Order[]> {
    const result = await db.query(`
      SELECT 
        co.id,
        co.created_at AS "createdAt",
        co.status,
        co.total_value AS "totalValue",
        co.due_date AS "dueDate",
        co.enough_items AS "enoughItems",
        co.ml_order_id IS NOT NULL AS "isFromMl",

        c.name AS "customerName",

        COUNT(oi.id) AS "totalItems",
        COALESCE(SUM(oi.quantity), 0) AS "totalQuantity"

      FROM customer_order co
      JOIN customer c ON c.id = co.customer_id
      LEFT JOIN order_item oi ON oi.order_id = co.id

      WHERE co.status IN ('confirmado', 'em_producao')

      GROUP BY co.id, c.name
      ORDER BY co.created_at DESC
    `);

    return result.rows;
  }

  async getNewOrders(): Promise<Order[]> {
    const result = await db.query(`
      SELECT 
        co.id,
        co.created_at AS "createdAt",
        co.status,
        co.total_value AS "totalValue",
        co.due_date AS "dueDate",
        co.enough_items AS "enoughItems",
        co.ml_order_id IS NOT NULL AS "isFromMl",

        c.name AS "customerName",

        COUNT(oi.id) AS "totalItems",
        COALESCE(SUM(oi.quantity), 0) AS "totalQuantity"

      FROM customer_order co
      JOIN customer c ON c.id = co.customer_id
      LEFT JOIN order_item oi ON oi.order_id = co.id

      WHERE co.status = 'novo'

      GROUP BY co.id, c.name
      ORDER BY co.created_at DESC
    `);

    return result.rows;
  }

  async getAllOrders(): Promise<Order[]> {
    const result = await db.query(`
      SELECT 
        co.id,
        co.created_at AS "createdAt",
        co.status,
        co.total_value AS "totalValue",
        co.due_date AS "dueDate",
        co.enough_items AS "enoughItems",
        co.ml_order_id IS NOT NULL AS "isFromMl",

        c.name AS "customerName",

        COUNT(oi.id) AS "totalItems",
        COALESCE(SUM(oi.quantity), 0) AS "totalQuantity"

      FROM customer_order co
      JOIN customer c ON c.id = co.customer_id
      LEFT JOIN order_item oi ON oi.order_id = co.id

      GROUP BY co.id, c.name
      ORDER BY co.created_at DESC
    `);

    return result.rows;
  }

  async getItemsByOrderId(id: number): Promise<OrderItem[]> {
    const result = await db.query(`
      SELECT 
        oi.id,
        oi.quantity,
        oi.unit_price AS "unitPrice",
        oi.fulfilled_quantity AS "fulfilledQuantity",
        oi.status,

        pv.id AS "variationId",
        pv.size,
        pv.color,
        pv.sku,

        p.id AS "productId",
        p.name AS "productName"

      FROM order_item oi
      JOIN product_variation pv ON pv.id = oi.product_variation_id
      JOIN product p ON p.id = pv.product_id

      WHERE oi.order_id = $1
      ORDER BY oi.id
    `, [id]);

    return result.rows.map(row => ({
      id: row.id,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      fulfilledQuantity: row.fulfilledQuantity,
      status: row.status,

      product: {
        id: row.productId,
        name: row.productName
      },

      variation: {
        id: row.variationId,
        size: row.size,
        color: row.color,
        sku: row.sku
      }
    }));
  }

  async createOrder(data: CreateOrderInput): Promise<ConfirmedOrder> {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const orderResult = await client.query(`
        INSERT INTO customer_order (customer_id, due_date, status, enough_items)
        VALUES ($1, $2, 'novo', FALSE)
        RETURNING
          id,
          created_at AS "createdAt",
          status,
          total_value AS "totalValue",
          due_date AS "dueDate",
          enough_items AS "enoughItems"
      `, [data.customerId, data.dueDate]);

      const order: ConfirmedOrder = orderResult.rows[0];
      const orderId = order.id;

      const items = data.items ?? [];
      let allFulfilled = items.length > 0;

      for (const item of items) {
        // Lock the variation row to avoid race conditions
        const varResult = await client.query(`
          SELECT stock, base_price FROM product_variation
          WHERE id = $1
          FOR UPDATE
        `, [item.variationId]);

        const variation = varResult.rows[0];
        const currentStock: number = variation?.stock ?? 0;
        const unitPrice: number = variation?.base_price ?? 0;

        const fulfilledQuantity = Math.min(item.quantity, currentStock);

        let itemStatus: string;
        if (fulfilledQuantity >= item.quantity) {
          itemStatus = 'atendido';
        } else if (fulfilledQuantity > 0) {
          itemStatus = 'parcial';
          allFulfilled = false;
        } else {
          itemStatus = 'pendente';
          allFulfilled = false;
        }

        // Deduct fulfilled quantity from stock
        if (fulfilledQuantity > 0) {
          await client.query(`
            UPDATE product_variation
            SET stock = stock - $1
            WHERE id = $2
          `, [fulfilledQuantity, item.variationId]);
        }

        await client.query(`
          INSERT INTO order_item (order_id, product_variation_id, quantity, unit_price, fulfilled_quantity, status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [orderId, item.variationId, item.quantity, unitPrice, fulfilledQuantity, itemStatus]);
      }

      // Update enough_items based on whether all items were fully fulfilled
      const enoughItems = items.length > 0 && allFulfilled;
      const updatedResult = await client.query(`
        UPDATE customer_order
        SET enough_items = $1
        WHERE id = $2
        RETURNING
          id,
          created_at AS "createdAt",
          status,
          total_value AS "totalValue",
          due_date AS "dueDate",
          enough_items AS "enoughItems"
      `, [enoughItems, orderId]);

      await client.query('COMMIT');
      return updatedResult.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deliverOrder(id: number): Promise<ConfirmedOrder | null> {
    const result = await db.query(`
      UPDATE customer_order
      SET status = 'finalizado'
      WHERE id = $1
      RETURNING
        id,
        created_at AS "createdAt",
        status,
        total_value AS "totalValue",
        due_date AS "dueDate",
        enough_items AS "enoughItems"
    `, [id]);

    if (!result.rows[0]) return null;

    return result.rows[0];
  }

  async confirmOrder(id: number): Promise<ConfirmedOrder | null> {
    const result = await db.query(`
      UPDATE customer_order
      SET status = 'confirmado'
      WHERE id = $1
      RETURNING
        id,
        created_at AS "createdAt",
        status,
        total_value AS "totalValue",
        due_date AS "dueDate",
        enough_items AS "enoughItems"
    `, [id]);

    if (!result.rows[0]) return null;

    await db.query(`
      UPDATE production_batch
      SET completed = TRUE,
          end_date  = COALESCE(end_date, NOW())
      WHERE production_id IN (
        SELECT id FROM production
        WHERE order_id = $1
          AND status NOT IN ('finalizado', 'cancelado')
      )
    `, [id]);

    await db.query(`
      UPDATE production
      SET status   = 'finalizado',
          end_date = COALESCE(end_date, NOW())
      WHERE order_id = $1
        AND status NOT IN ('finalizado', 'cancelado')
    `, [id]);

    return result.rows[0];
  }
}
