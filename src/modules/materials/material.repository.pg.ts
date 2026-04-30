import { db } from "../../database/db.js";
import type { MaterialRepositoryInterface } from "./material.repository.interface.js";

export class MaterialRepositoryPg implements MaterialRepositoryInterface {

  async findAllVariations(): Promise<any[]> {
    const result = await db.query(`
      SELECT
        mv.id,
        mv.variacao,
        mv.estoque,

        m.id AS material_id,
        m.nome AS material_nome,
        m.unidade_base

      FROM material_variacao mv
      JOIN material m ON m.id = mv.material_id

      ORDER BY m.nome, mv.variacao
    `);

    return result.rows.map(row => ({
      id: row.id,
      variacao: row.variacao,
      estoque: row.estoque,

      material: {
        id: row.material_id,
        nome: row.material_nome,
        unidade_base: row.unidade_base
      }
    }));
  }

  async decrementStockByVariationId(variationId: number, quantity: number): Promise<void> {
    await db.query(`
      UPDATE material_variacao
      SET estoque = estoque - $1
      WHERE id = $2
    `, [quantity, variationId]);
  }

}