import type { Request, Response } from "express";
import { OrderService } from "./order.service.js";
import { OrderRepositoryPg } from "./order.repository.pg.js";

const repositorPg = new OrderRepositoryPg;
const service = new OrderService(repositorPg);

export class OrderController {
  async getOrders(req: Request, res: Response) {

    const { type } = req.query;

    let data;

    switch (type) {
      case 'done':
        data = await service.getDoneOrders();
        break;
      case 'progress':
        data = await service.getProgressOrders();
        break;
      default:
        data = await service.getOrders();
    }

    return res.json(data);
  }
  async getItemsByOrderId(req: Request, res: Response) {
    const pedidoId = Number(req.params.id);

    const items = await service.getItemsByOrderId(pedidoId);

    return res.json(items);
  }

  async deliverOrder(req: Request, res: Response) {
    const pedidoId = Number(req.params.id);

    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
      return res.status(400).json({ error: "id do pedido invalido" });
    }

    const order = await service.deliverOrder(pedidoId);

    if (!order) {
      return res.status(404).json({ error: "Pedido nao encontrado" });
    }

    return res.json({ message: "Pedido entregue com sucesso.", order });
  }

  async confirmOrder(req: Request, res: Response) {
    const pedidoId = Number(req.params.id);

    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
      return res.status(400).json({ error: "id do pedido invalido" });
    }

    const order = await service.confirmOrder(pedidoId);

    if (!order) {
      return res.status(404).json({ error: "Pedido nao encontrado" });
    }

    return res.json(order);
  }

  async createOrder(req: Request, res: Response) {
    const { customerId, dueDate, items } = req.body;

    if (!customerId || !dueDate) {
      return res.status(400).json({ error: "customerId e dueDate sao obrigatorios" });
    }

    const order = await service.createOrder({ customerId, dueDate, items });

    return res.status(201).json(order);
  }
}
