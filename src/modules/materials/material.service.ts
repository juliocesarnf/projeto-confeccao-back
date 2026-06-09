import type { MaterialRepositoryInterface } from "./material.repository.interface.js";
import type { MaterialVariationInfo, PurchaseMaterialInput, RequiredMaterialInput } from "../../types/MaterialTypes.js";

export type { MaterialVariationInfo } from "../../types/MaterialTypes.js";

export class MaterialService {
  constructor(private readonly repository: MaterialRepositoryInterface) {}

  async getAllMaterials() {
    return this.repository.getAllMaterials();
  }

  async createMaterial(data: { name: string; baseUnit: string; quantityPerPackage?: number }) {
    return this.repository.createMaterial(data);
  }

  async getAllVariations() {
    return this.repository.getAllVariations();
  }

  async getVariationsByMaterialId(id: number) {
    return this.repository.getVariationsByMaterialId(id);
  }

  async updateVariation(id: number, variation: string, stock: number) {
    return this.repository.updateVariation(id, variation, stock);
  }

  async removeStockVariations(variations: MaterialVariationInfo[]) {
    for (const item of variations) {
      await this.repository.decrementStockByVariationId(item.materialVariationId, item.quantity);
    }
  }

  async getRequiredMaterialsSuppliers(materials: RequiredMaterialInput[]) {
    return this.repository.getRequiredMaterialsSuppliers(materials);
  }

  async purchaseMaterials(items: PurchaseMaterialInput[]) {
    await this.repository.purchaseMaterials(items);
  }

  async addStockPack(id: number) {
    return this.repository.addStockPack(id);
  }

  async removeStockPack(id: number) {
    return this.repository.removeStockPack(id);
  }
}
