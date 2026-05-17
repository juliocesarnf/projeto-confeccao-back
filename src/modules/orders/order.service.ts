import type { OrderRepositoryInterface } from "./order.repository.interface.js";

export class OrderService {
  constructor(private readonly repository: OrderRepositoryInterface) {}

  async getDoneOrders() {
    return this.repository.getDoneOrders();
  }

  async getProgressOrders() {
    return this.repository.getProgressOrders();
  }

  async getNewOrders() {
    return this.repository.getNewOrders();
  }

  async getOrders() {
    return this.repository.getAllOrders();
  }

  async getItemsByOrderId(pedidoId: number) {
    return this.repository.getItemsByOrderId(pedidoId);
  }

  async confirmOrder(pedidoId: number) {
    return this.repository.confirmOrder(pedidoId);
  }
}
