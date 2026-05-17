import type { MaterialRepositoryInterface } from "./material.repository.interface.js";

export type MaterialVariationInfo = {
  variation_id: number;
  material: string;
  variation: string;
  quantity: number;
  base_unit: string;
};

export class MaterialService {
  constructor(private readonly repository: MaterialRepositoryInterface) {}

  async getAllVariations() {
    return this.repository.getAllVariations();
  }

  async removeStockVariations(variations: MaterialVariationInfo[]) {
    for (const item of variations) {
      await this.repository.decrementStockByVariationId(item.variation_id, item.quantity);
    }
  }
}