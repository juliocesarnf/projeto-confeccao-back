import type { CreatedProduction, CreateProductionInput, ProductionDetailView } from "../../types/ProductionTypes.js";

export interface ProductionRepositoryInterface {
  getAllProductions(): Promise<any[]>;
  createProduction(data: CreateProductionInput): Promise<CreatedProduction>;
  getProductionByOrderId(id: number): Promise<ProductionDetailView | null>;
  fulfillItems(orderId: number, itemIds: number[]): Promise<void>;
  updateBatchStatus(batchId: number, completed: boolean): Promise<void>;
}
