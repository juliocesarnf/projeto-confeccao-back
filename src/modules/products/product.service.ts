import type { ProductRepositoryInterface } from "./product.repository.interface.js";

export class ProductService {
  constructor(private readonly repository: ProductRepositoryInterface) {}

  async getAllProducts() {
    return this.repository.getAllProducts();
  }

  async createProduct(data: { name: string; description?: string; category?: string; active: boolean }) {
    return this.repository.createProduct(data);
  }

  async getAllVariations() {
    return this.repository.getAllVariations();
  }

  async getVariationsByProductId(id: number) {
    return this.repository.getVariationsByProductId(id);
  }

  async updateVariation(id: number, stock: number) {
    return this.repository.updateVariation(id, stock);
  }

  async getMaterialsForProductVariationId(id: number) {
    return this.repository.getMaterialsForProductVariationId(id);
  }

  async getMaterialsByVariationIds(ids: number[]) {
    return this.repository.getMaterialsByVariationIdList(ids);
  }

  async getProcessesByProductIdList(productIds: number[]) {
    return this.repository.getProcessesByProductIdList(productIds);
  }
}