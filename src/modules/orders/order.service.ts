import type { OrderRepositoryInterface } from "./order.repository.interface.js";
import type { CreateOrderInput } from "../../types/OrderTypes.js";

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

  async deliverOrder(pedidoId: number) {
    return this.repository.deliverOrder(pedidoId);
  }

  async createOrder(data: CreateOrderInput) {
    return this.repository.createOrder(data);
  }
}
