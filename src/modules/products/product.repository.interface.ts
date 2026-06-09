import type { Product, ProductProcessesResult, ProductVariation } from "../../types/ProductTypes.js";

export interface ProductRepositoryInterface {
  getAllProducts(): Promise<Product[]>;
  createProduct(data: { name: string; description?: string; category?: string; active: boolean }): Promise<Product>;
  getMaterialsForProductVariationId(id: number): Promise<any[]>;
  getAllVariations(): Promise<any[]>;
  getVariationsByProductId(id: number): Promise<ProductVariation[]>;
  updateVariation(id: number, data: { size: string | null; color: string | null; stock: number }): Promise<ProductVariation>;
  addStock(id: number): Promise<ProductVariation>;
  removeStock(id: number): Promise<ProductVariation>;
  getMaterialsByVariationIdList(ids: number[]): Promise<any[]>;
  getProcessesByProductIdList(productIds: number[]): Promise<ProductProcessesResult[]>;
}