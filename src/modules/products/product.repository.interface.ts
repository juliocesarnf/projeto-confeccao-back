import type { ProductToDo } from "./product.controller.js";

export interface ProductRepositoryInterface {
  getMaterialsForProductVariationId(id: number): Promise<any[]>;
  getAllVariations(): Promise<any[]>;
  getMaterialsByVariationIds(ids: number[]): Promise<any[]>;
  getProcessesByProductIdList(products: ProductToDo[]): Promise<any[]>;
}