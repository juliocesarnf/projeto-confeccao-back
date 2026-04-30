import type { OrderRepositoryInterface } from "./order.repository.interface.js";
import { db } from "../../database/db.js";

export class OrderRepositoryPg implements OrderRepositoryInterface {

  async doneOrders(): Promise<any[]> {
    const result = await db.query(`
      SELECT 
        p.id,
        p.data,
        p.status,
        p.valor_total,
        p.data_prevista_entrega,

        c.nome AS cliente_nome,

        COUNT(ip.id) AS total_itens,
        SUM(ip.quantidade) AS total_quantidade

      FROM pedido p
      JOIN cliente c ON c.id = p.cliente_id
      LEFT JOIN item_pedido ip ON ip.pedido_id = p.id

      WHERE p.status = 'finalizado'

      GROUP BY p.id, c.nome
      ORDER BY p.data DESC
    `);

    return result.rows;
  }

  async progressOrders(): Promise<any[]> {
    const result = await db.query(`
      SELECT 
        p.id,
        p.data,
        p.status,
        p.valor_total,
        p.data_prevista_entrega,

        c.nome AS cliente_nome,

        COUNT(ip.id) AS total_itens,
        SUM(ip.quantidade) AS total_quantidade

      FROM pedido p
      JOIN cliente c ON c.id = p.cliente_id
      LEFT JOIN item_pedido ip ON ip.pedido_id = p.id

      WHERE p.status IN ('confirmado', 'em_producao')

      GROUP BY p.id, c.nome
      ORDER BY p.data DESC
    `);

    return result.rows;
  }

  async newOrders(): Promise<any[]> {
    const result = await db.query(`
      SELECT 
        p.id,
        p.data,
        p.status,
        p.valor_total,
        p.prazo,

        c.nome AS cliente_nome,

        COUNT(ip.id) AS total_itens,
        SUM(ip.quantidade) AS total_quantidade

      FROM pedido p
      JOIN cliente c ON c.id = p.cliente_id
      LEFT JOIN item_pedido ip ON ip.pedido_id = p.id

      WHERE p.status = 'novo'

      GROUP BY p.id, c.nome
      ORDER BY p.data DESC
    `);

    return result.rows;
  }

  async allOrders(): Promise<any[]> {
    const result = await db.query(`
      SELECT 
        p.id,
        p.data,
        p.status,
        p.valor_total,
        p.prazo,

        c.nome AS cliente_nome,

        COUNT(ip.id) AS total_itens,
        SUM(ip.quantidade) AS total_quantidade

      FROM pedido p
      JOIN cliente c ON c.id = p.cliente_id
      LEFT JOIN item_pedido ip ON ip.pedido_id = p.id

      GROUP BY p.id, c.nome
      ORDER BY p.data DESC
    `);

    return result.rows;
  }

  async getItemsByOrderId(id: number): Promise<any[]> {
    const result = await db.query(`
      SELECT 
        ip.id,
        ip.quantidade,
        ip.preco_unitario,
        ip.quantidade_atendida,
        ip.status,

        vp.id AS variacao_id,
        vp.tamanho,
        vp.cor,
        vp.sku,

        p.id AS produto_id,
        p.nome AS produto_nome

      FROM item_pedido ip
      JOIN variacao_produto vp ON vp.id = ip.variacao_produto_id
      JOIN produto p ON p.id = vp.produto_id

      WHERE ip.pedido_id = $1
      ORDER BY ip.id
    `, [id]);

    return result.rows.map(row => ({
        id: row.id,
        quantidade: row.quantidade,
        preco_unitario: row.preco_unitario,
        quantidade_atendida: row.quantidade_atendida,
        status: row.status,

        produto: {
          id: row.produto_id,
          nome: row.produto_nome
        },

        variacao: {
          id: row.variacao_id,
          tamanho: row.tamanho,
          cor: row.cor,
          sku: row.sku
        }
    }));
  }
}