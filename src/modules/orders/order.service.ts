import type { OrderRepositoryInterface } from "./order.repository.interface.js";

export class OrderService {
  constructor(private readonly repository: OrderRepositoryInterface) {}

  async getDoneOrders() {
    return this.repository.doneOrders();
  }

  async getProgressOrders() {
    return this.repository.progressOrders();
  }

  async getNewOrders() {
    return this.repository.newOrders();
  }

  async getOrders() {
    return this.repository.allOrders();
  }

  async getItemsByOrderId(pedidoId: number) {
    return this.repository.getItemsByOrderId(pedidoId);
  }
}