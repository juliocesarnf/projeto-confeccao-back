import { db } from "../../database/db.js";
import type { MaterialRepositoryInterface } from "./material.repository.interface.js";
import type {
  MaterialVariation,
  PurchaseMaterialInput,
  RequiredMaterialInput,
  RequiredMaterialSuppliers,
} from "../../types/MaterialTypes.js";

export class MaterialRepositoryPg implements MaterialRepositoryInterface {

  async getAllMaterials(): Promise<any[]> {
    const result = await db.query(`
      SELECT id, name, base_unit AS "baseUnit", quantity_per_package AS "quantityPerPackage"
      FROM material
      ORDER BY name
    `);
    return result.rows;
  }

  async createMaterial(data: { name: string; baseUnit: string; quantityPerPackage?: number }): Promise<any> {
    const result = await db.query(
      `
      INSERT INTO material (name, base_unit, quantity_per_package)
      VALUES ($1, $2, $3)
      RETURNING id, name, base_unit AS "baseUnit", quantity_per_package AS "quantityPerPackage"
      `,
      [data.name, data.baseUnit, data.quantityPerPackage ?? 1]
    );
    return result.rows[0];
  }

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

  async getVariationsByMaterialId(id: number): Promise<MaterialVariation[]> {
    const result = await db.query(
      `
      SELECT id, variation, stock
      FROM material_variation
      WHERE material_id = $1
      ORDER BY variation
      `,
      [id]
    );

    return result.rows.map(row => ({
      id: row.id,
      variation: row.variation,
      stock: Number(row.stock),
    }));
  }

  async updateVariation(id: number, variation: string, stock: number): Promise<MaterialVariation> {
    const result = await db.query(
      `
      UPDATE material_variation
      SET variation = $1, stock = $2
      WHERE id = $3
      RETURNING id, variation, stock
      `,
      [variation, stock, id]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      variation: row.variation,
      stock: Number(row.stock),
    };
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

  async getRequiredMaterialsSuppliers(
    materials: RequiredMaterialInput[]
  ): Promise<RequiredMaterialSuppliers[]> {
    const materialIds = [...new Set(materials.map((material) => material.materialId))];

    if (materialIds.length === 0) {
      return [];
    }

    const supplierResult = await db.query(
      `
      SELECT
        m.id AS "materialId",
        m.name AS "materialName",
        s.id AS "supplierId",
        s.name AS "supplierName",
        ms.price
      FROM material m
      LEFT JOIN material_supplier ms ON ms.material_id = m.id
      LEFT JOIN supplier s ON s.id = ms.supplier_id
      WHERE m.id = ANY($1::int[])
      ORDER BY m.name, ms.price NULLS LAST
      `,
      [materialIds]
    );

    const suppliersByMaterialId: Record<number, RequiredMaterialSuppliers> = supplierResult.rows.reduce((acc, row) => {
      const materialId = row.materialId;

      if (!acc[materialId]) {
        acc[materialId] = {
          materialId,
          materialName: row.materialName,
          suppliers: [],
        };
      }

      if (row.supplierId !== null) {
        acc[materialId].suppliers.push({
          supplierId: row.supplierId,
          supplierName: row.supplierName,
          price: Number(row.price),
        });
      }

      return acc;
    }, {} as Record<number, RequiredMaterialSuppliers>);

    return Object.values(suppliersByMaterialId);
  }

  async addStockPack(id: number): Promise<MaterialVariation> {
    const result = await db.query(
      `UPDATE material_variation mv
       SET stock = stock + m.quantity_per_package
       FROM material m
       WHERE mv.material_id = m.id AND mv.id = $1
       RETURNING mv.id, mv.variation, mv.stock`,
      [id]
    );
    const row = result.rows[0];
    return { id: row.id, variation: row.variation, stock: Number(row.stock) };
  }

  async removeStockPack(id: number): Promise<MaterialVariation> {
    const result = await db.query(
      `UPDATE material_variation mv
       SET stock = stock - m.quantity_per_package
       FROM material m
       WHERE mv.material_id = m.id AND mv.id = $1
       RETURNING mv.id, mv.variation, mv.stock`,
      [id]
    );
    const row = result.rows[0];
    return { id: row.id, variation: row.variation, stock: Number(row.stock) };
  }

  async purchaseMaterials(items: PurchaseMaterialInput[]): Promise<void> {
    if (items.length === 0) return;

    const variationIds = items.map((i) => i.materialVariationId);

    const result = await db.query(
      `SELECT mv.id AS variation_id, m.quantity_per_package
       FROM material_variation mv
       JOIN material m ON m.id = mv.material_id
       WHERE mv.id = ANY($1::int[])`,
      [variationIds]
    );

    const packageSizeByVariationId: Record<number, number> = {};
    for (const row of result.rows) {
      packageSizeByVariationId[row.variation_id] = row.quantity_per_package;
    }

    for (const item of items) {
      const qpp = packageSizeByVariationId[item.materialVariationId] ?? 1;
      const quantityToAdd = Math.ceil(item.quantity / qpp) * qpp;
      await db.query(
        `UPDATE material_variation SET stock = stock + $1 WHERE id = $2`,
        [quantityToAdd, item.materialVariationId]
      );
    }
  }

}
