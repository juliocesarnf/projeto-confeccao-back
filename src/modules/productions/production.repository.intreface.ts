import type { CreatedProduction, CreateProductionInput, ProductionDetailView } from "../../types/production.js";

export interface ProductionRepositoryInterface {
  getAllProductions(): Promise<any[]>;
  createProduction(data: CreateProductionInput): Promise<CreatedProduction>;
  getProductionById(id: number): Promise<ProductionDetailView | null>;
  fulfillItems(orderId: number, itemIds: number[]): Promise<void>;
}
