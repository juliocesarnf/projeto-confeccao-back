import { db } from "../../database/db.js";
import type { ProductToDo } from "../../types/product.js";
import type { ProductRepositoryInterface } from "./product.repository.interface.js";

export class ProductRepositoryPg implements ProductRepositoryInterface {

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

  async getAllVariations(): Promise<any[]> {
    return [];
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

  async getProcessesByProductIdList(products: ProductToDo[]): Promise<any[]> {
    const productIds = products.map(product => product.productId);

    if (productIds.length === 0) {
      return products.map(product => ({
        ...product,
        processos: [],
      }));
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
        productId: row.productId,
        processId: row.processId,
        stepOrder: row.stepOrder,
        dificultyLevel: row.dificultyLevel,
        name: row.processName,
      });

      return acc;
    }, {} as Record<number, any[]>);

    return products.map(product => ({
      ...product,
      processes: processesByProductId[product.productId] ?? [],
    }));
  }

}
