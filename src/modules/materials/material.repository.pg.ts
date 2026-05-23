import { db } from "../../database/db.js";
import type { MaterialRepositoryInterface } from "./material.repository.interface.js";
import type {
  PurchaseMaterialInput,
  RequiredMaterialInput,
  RequiredMaterialSuppliers,
} from "../../types/material.js";

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
