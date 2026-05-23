export interface OrderRepositoryInterface {
  getDoneOrders(): Promise<any[]>;
  getProgressOrders(): Promise<any[]>;
  getNewOrders(): Promise<any[]>;
  getAllOrders(): Promise<any[]>;
  getItemsByOrderId(id: number): Promise<any[]>;
  confirmOrder(id: number): Promise<any | null>;
}
