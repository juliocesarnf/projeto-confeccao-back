import type { ProductToDo } from "./product.controller.js";
import type { ProductRepositoryInterface } from "./product.repository.interface.js";

export class ProductService {
  constructor(private readonly repository: ProductRepositoryInterface) {}

  async getAllVariations() {
    return this.repository.getAllVariations()
  }

  async getMaterialsForProductVariationId(id: number) {
    return this.repository.getMaterialsForProductVariationId(id);
  }

  async getMaterialsByVariationIds(ids: number[]) {
    return this.repository.getMaterialsByVariationIdList(ids);
  }

  async getProcessesByProductIdList(products: ProductToDo[]) {
    return this.repository.getProcessesByProductIdList(products);
  }
}