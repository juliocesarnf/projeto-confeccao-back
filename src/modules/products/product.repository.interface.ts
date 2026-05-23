import type { ProductToDo } from "../../types/product.js";

export interface ProductRepositoryInterface {
  getMaterialsForProductVariationId(id: number): Promise<any[]>;
  getAllVariations(): Promise<any[]>;
  getMaterialsByVariationIdList(ids: number[]): Promise<any[]>;
  getProcessesByProductIdList(products: ProductToDo[]): Promise<any[]>;
}