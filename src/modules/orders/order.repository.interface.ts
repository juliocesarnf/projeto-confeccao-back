export interface OrderRepositoryInterface {
  doneOrders(): Promise<any[]>;
  progressOrders(): Promise<any[]>;
  newOrders(): Promise<any[]>;
  allOrders(): Promise<any[]>;
  getItemsByOrderId(id: number): Promise<any[]>;
  
}