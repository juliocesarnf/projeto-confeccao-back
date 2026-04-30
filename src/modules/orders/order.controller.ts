import type { Request, Response } from "express";
import { OrderService } from "./order.service.js";
import { OrderRepositoryPg } from "./order.repository.pg.js";

const repositorPg = new OrderRepositoryPg;
const service = new OrderService(repositorPg);

export class OrderController {
  async get(req: Request, res: Response) {

    const id = Number(req.params.id);
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
  async getItems(req: Request, res: Response) {
    const pedidoId = Number(req.params.id);

    const items = await service.getItemsByOrderId(pedidoId);

    return res.json(items);
  }
}