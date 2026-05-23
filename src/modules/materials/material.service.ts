import type { MaterialRepositoryInterface } from "./material.repository.interface.js";
import type { MaterialVariationInfo, PurchaseMaterialInput, RequiredMaterialInput } from "../../types/material.js";

export type { MaterialVariationInfo } from "../../types/material.js";

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

  async getRequiredMaterialsSuppliers(materials: RequiredMaterialInput[]) {
    return this.repository.getRequiredMaterialsSuppliers(materials);
  }

  async purchaseMaterials(items: PurchaseMaterialInput[]) {
    await this.repository.purchaseMaterials(items);
  }
}
