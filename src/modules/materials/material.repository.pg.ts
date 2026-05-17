import { db } from "../../database/db.js";
import type { MaterialRepositoryInterface } from "./material.repository.interface.js";

export class MaterialRepositoryPg implements MaterialRepositoryInterface {

  async getAllVariations(): Promise<any[]> {
    const result = await db.query(`
      SELECT
        mv.id,
        mv.variation,
        mv.stock,

        m.id AS "materialId",
        m.name AS "materialName",
        m.base_unit AS "baseUnit"

      FROM material_variation mv
      JOIN material m ON m.id = mv.material_id

      ORDER BY m.name, mv.variation
    `);

    return result.rows.map(row => ({
      id: row.id,
      variation: row.variation,
      stock: row.stock,

      material: {
        id: row.materialId,
        name: row.materialName,
        baseUnit: row.baseUnit
      }
    }));
  }

  async decrementStockByVariationId(
    variationId: number,
    quantity: number
  ): Promise<void> {
    await db.query(`
      UPDATE material_variation
      SET stock = stock - $1
      WHERE id = $2
    `, [quantity, variationId]);
  }

}