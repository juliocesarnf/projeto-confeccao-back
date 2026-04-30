import { db } from "../../database/db.js";
import type { ProductToDo } from "./product.controller.js";
import type { ProductRepositoryInterface } from "./product.repository.interface.js";

export class ProductRepositoryPg implements ProductRepositoryInterface {

  async getMaterialsForProductVariationId(id: number): Promise<any[]> {
    const result = await db.query(
      `
      SELECT 
        pm.id,
        pm.quantidade,

        vp.id AS variacao_produto_id,
        vp.produto_id,

        mv.id AS material_variacao_id,
        mv.variacao,
        mv.estoque,

        m.id AS material_id,
        m.nome AS material_nome,
        m.unidade_base

      FROM produto_material pm

      INNER JOIN variacao_produto vp
        ON vp.id = pm.variacao_produto_id

      INNER JOIN material_variacao mv 
        ON mv.id = pm.material_variacao_id

      INNER JOIN material m 
        ON m.id = mv.material_id

      WHERE pm.variacao_produto_id = $1
      `,
      [id]
    );

    return result.rows.map(row => ({
      id: row.id,
      quantidade: row.quantidade,

      variacao_produto_id: row.variacao_produto_id,
      produto_id: row.produto_id,

      material_variacao: {
        id: row.material_variacao_id,
        variacao: row.variacao,
        estoque: row.estoque,
      },

      material: {
        id: row.material_id,
        nome: row.material_nome,
        unidade_base: row.unidade_base,
      }
    }));
  }

  async getAllVariations(): Promise<any[]> {
    return [];
  }

  async getMaterialsByVariationIds(ids: number[]): Promise<any[]> {
    const result = await db.query(
      `
      SELECT 
        pm.id,
        pm.quantidade,

        vp.id AS variacao_produto_id,
        vp.produto_id,

        mv.id AS material_variacao_id,
        mv.variacao,
        mv.estoque,

        m.id AS material_id,
        m.nome AS material_nome,
        m.unidade_base

      FROM produto_material pm

      INNER JOIN variacao_produto vp
        ON vp.id = pm.variacao_produto_id

      INNER JOIN material_variacao mv 
        ON mv.id = pm.material_variacao_id

      INNER JOIN material m 
        ON m.id = mv.material_id

      WHERE pm.variacao_produto_id = ANY($1)
      `,
      [ids] // 👈 aqui vai o array direto
    );

    return result.rows.map(row => ({
      id: row.id,
      quantidade: row.quantidade,

      variacao_produto_id: row.variacao_produto_id,
      produto_id: row.produto_id,

      material_variacao: {
        id: row.material_variacao_id,
        variacao: row.variacao,
        estoque: row.estoque,
      },

      material: {
        id: row.material_id,
        nome: row.material_nome,
        unidade_base: row.unidade_base,
      }
    }));
  }

  async getProcessesByProductIdList(products: ProductToDo[]): Promise<any[]> {
    const productIds = products.map(product => product.id_Produto);

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
        pp.produto_id,
        pp.processo_id,
        pp.ordem,
        pp.tempo_estimado,
        pr.nome AS processo_nome
      FROM produto_processo pp
      INNER JOIN processo pr
        ON pr.id = pp.processo_id
      WHERE pp.produto_id = ANY($1)
      ORDER BY pp.produto_id, pp.ordem
      `,
      [productIds]
    );

    const processesByProductId = result.rows.reduce((acc, row) => {
      const produtoId = row.produto_id;
      if (!acc[produtoId]) {
        acc[produtoId] = [];
      }
      acc[produtoId].push({
        id: row.id,
        produto_id: row.produto_id,
        processo_id: row.processo_id,
        ordem: row.ordem,
        tempo_estimado: row.tempo_estimado,
        processo_nome: row.processo_nome,
      });
      return acc;
    }, {} as Record<number, any[]>);

    return products.map(product => ({
      ...product,
      processos: processesByProductId[product.id_Produto] ?? [],
    }));
  } 

}