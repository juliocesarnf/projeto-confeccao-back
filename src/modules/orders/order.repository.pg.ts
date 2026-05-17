import type { OrderRepositoryInterface } from "./order.repository.interface.js";
import { db } from "../../database/db.js";

export class OrderRepositoryPg implements OrderRepositoryInterface {

  async getDoneOrders(): Promise<any[]> {
    const result = await db.query(`
      SELECT 
        co.id,
        co.created_at AS "createdAt",
        co.status,
        co.total_value AS "totalValue",
        co.due_date AS "dueDate",
        co.enough_items AS "enoughItems",

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

  async getProgressOrders(): Promise<any[]> {
    const result = await db.query(`
      SELECT 
        co.id,
        co.created_at AS "createdAt",
        co.status,
        co.total_value AS "totalValue",
        co.due_date AS "dueDate",
        co.enough_items AS "enoughItems",

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

  async getNewOrders(): Promise<any[]> {
    const result = await db.query(`
      SELECT 
        co.id,
        co.created_at AS "createdAt",
        co.status,
        co.total_value AS "totalValue",
        co.due_date AS "dueDate",
        co.enough_items AS "enoughItems",

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

  async getAllOrders(): Promise<any[]> {
    const result = await db.query(`
      SELECT 
        co.id,
        co.created_at AS "createdAt",
        co.status,
        co.total_value AS "totalValue",
        co.due_date AS "dueDate",
        co.enough_items AS "enoughItems",

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

  async getItemsByOrderId(id: number): Promise<any[]> {
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

  async confirmOrder(id: number): Promise<any | null> {
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

    return result.rows[0] ?? null;
  }
}
