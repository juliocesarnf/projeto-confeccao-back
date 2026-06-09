import { db } from "../../database/db.js";
import type { Product, ProductProcessesResult, ProductVariation } from "../../types/ProductTypes.js";
import type { ProductRepositoryInterface } from "./product.repository.interface.js";

export class ProductRepositoryPg implements ProductRepositoryInterface {

  async getAllProducts(): Promise<Product[]> {
    const result = await db.query(`
      SELECT id, name, description, category, active
      FROM product
      ORDER BY name
    `);
    return result.rows;
  }

  async updateVariation(id: number, data: { size: string | null; color: string | null; stock: number }): Promise<ProductVariation> {
    const result = await db.query(
      `
      UPDATE product_variation
      SET size = $1, color = $2, stock = $3
      WHERE id = $4
      RETURNING
        id,
        product_id AS "productId",
        size,
        color,
        stock
      `,
      [data.size, data.color, data.stock, id]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      productId: row.productId,
      size: row.size ?? null,
      color: row.color ?? null,
      stock: Number(row.stock),
    };
  }

  async addStock(id: number): Promise<ProductVariation> {
    const result = await db.query(
      `
      UPDATE product_variation
      SET stock = stock + 1
      WHERE id = $1
      RETURNING id, product_id AS "productId", size, color, stock
      `,
      [id]
    );
    const row = result.rows[0];
    return { id: row.id, productId: row.productId, size: row.size ?? null, color: row.color ?? null, stock: Number(row.stock) };
  }

  async removeStock(id: number): Promise<ProductVariation> {
    const result = await db.query(
      `
      UPDATE product_variation
      SET stock = GREATEST(stock - 1, 0)
      WHERE id = $1
      RETURNING id, product_id AS "productId", size, color, stock
      `,
      [id]
    );
    const row = result.rows[0];
    return { id: row.id, productId: row.productId, size: row.size ?? null, color: row.color ?? null, stock: Number(row.stock) };
  }

  async getMaterialsForProductVariationId(id: number): Promise<any[]> {
    const result = await db.query(
      `
      SELECT 
        pm.id,
        pm.quantity,

        pv.id AS "productVariationId",
        pv.product_id AS "productId",

        mv.id AS "materialVariationId",
        mv.variation,
        mv.stock,

        m.id AS "materialId",
        m.name AS "materialName",
        m.base_unit AS "baseUnit"

      FROM product_material pm

      INNER JOIN product_variation pv
        ON pv.id = pm.product_variation_id

      INNER JOIN material_variation mv 
        ON mv.id = pm.material_variation_id

      INNER JOIN material m 
        ON m.id = mv.material_id

      WHERE pm.product_variation_id = $1
      `,
      [id]
    );

    return result.rows.map(row => ({
      id: row.id,
      quantity: row.quantity,

      productVariationId: row.productVariationId,
      productId: row.productId,

      materialVariation: {
        id: row.materialVariationId,
        variation: row.variation,
        stock: row.stock,
      },

      material: {
        id: row.materialId,
        name: row.materialName,
        baseUnit: row.baseUnit,
      }
    }));
  }

  async createProduct(data: { name: string; description?: string; category?: string; active: boolean }): Promise<Product> {
    const result = await db.query(
      `
      INSERT INTO product (name, description, category, active)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, category, active
      `,
      [data.name, data.description ?? null, data.category ?? null, data.active]
    );

    return result.rows[0];
  }

  async getAllVariations(): Promise<any[]> {
    return [];
  }

  async getVariationsByProductId(id: number): Promise<ProductVariation[]> {
    const result = await db.query(
      `
      SELECT
        id,
        product_id AS "productId",
        size,
        color,
        stock
      FROM product_variation
      WHERE product_id = $1 AND active = TRUE
      ORDER BY id
      `,
      [id]
    );

    return result.rows.map(row => ({
      id: row.id,
      productId: row.productId,
      size: row.size ?? null,
      color: row.color ?? null,
      stock: Number(row.stock),
    }));
  }

  async getMaterialsByVariationIdList(ids: number[]): Promise<any[]> {
    const result = await db.query(
      `
      SELECT 
        pm.id,
        pm.quantity,

        pv.id AS "productVariationId",
        pv.product_id AS "productId",

        mv.id AS "materialVariationId",
        mv.variation,
        mv.stock,

        m.id AS "materialId",
        m.name AS "materialName",
        m.base_unit AS "baseUnit"

      FROM product_material pm

      INNER JOIN product_variation pv
        ON pv.id = pm.product_variation_id

      INNER JOIN material_variation mv 
        ON mv.id = pm.material_variation_id

      INNER JOIN material m 
        ON m.id = mv.material_id

      WHERE pm.product_variation_id = ANY($1)
      `,
      [ids]
    );

    return result.rows.map(row => ({
      id: row.id,
      quantity: row.quantity,

      productVariationId: row.productVariationId,
      productId: row.productId,

      materialVariation: {
        id: row.materialVariationId,
        variation: row.variation,
        stock: row.stock,
      },

      material: {
        id: row.materialId,
        name: row.materialName,
        baseUnit: row.baseUnit,
      }
    }));
  }

  async getProcessesByProductIdList(productIds: number[]): Promise<ProductProcessesResult[]> {
    if (productIds.length === 0) {
      return [];
    }

    const result = await db.query(
      `
      SELECT
        pp.id,
        pp.product_id AS "productId",
        pp.process_id AS "processId",
        pp.step_order AS "stepOrder",
        pp.dificulty_level AS "dificultyLevel",
        pr.name AS "processName"

      FROM product_process pp

      INNER JOIN process pr
        ON pr.id = pp.process_id

      WHERE pp.product_id = ANY($1)

      ORDER BY pp.product_id, pp.step_order
      `,
      [productIds]
    );

    const processesByProductId = result.rows.reduce((acc, row) => {
      const productId = row.productId;

      if (!acc[productId]) {
        acc[productId] = [];
      }

      acc[productId].push({
        id: row.id,
        processId: row.processId,
        stepOrder: row.stepOrder,
        dificultyLevel: row.dificultyLevel,
        name: row.processName,
      });

      return acc;
    }, {} as Record<number, any[]>);

    return productIds.map(productId => ({
      productId,
      processes: processesByProductId[productId] ?? [],
    }));
  }

}
