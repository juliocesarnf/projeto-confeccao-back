import type { Order, OrderItem, ConfirmedOrder, CreateOrderInput } from "../../types/OrderTypes.js";

export interface OrderRepositoryInterface {
  getDoneOrders(): Promise<Order[]>;
  getProgressOrders(): Promise<Order[]>;
  getNewOrders(): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getItemsByOrderId(id: number): Promise<OrderItem[]>;
  confirmOrder(id: number): Promise<ConfirmedOrder | null>;
  deliverOrder(id: number): Promise<ConfirmedOrder | null>;
  createOrder(data: CreateOrderInput): Promise<ConfirmedOrder>;
}
