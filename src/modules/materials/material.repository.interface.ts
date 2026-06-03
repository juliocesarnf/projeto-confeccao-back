import type {
  MaterialVariation,
  RequiredMaterialInput,
  RequiredMaterialSuppliers,
  PurchaseMaterialInput,
} from "../../types/MaterialTypes.js";

export interface MaterialRepositoryInterface {
  getAllMaterials(): Promise<any[]>;
  createMaterial(data: { name: string; baseUnit: string; quantityPerPackage?: number }): Promise<any>;
  getAllVariations(): Promise<any[]>;
  getVariationsByMaterialId(id: number): Promise<MaterialVariation[]>;
  updateVariation(id: number, variation: string, stock: number): Promise<MaterialVariation>;
  decrementStockByVariationId(variationId: number, quantity: number): Promise<void>;
  getRequiredMaterialsSuppliers(materials: RequiredMaterialInput[]): Promise<RequiredMaterialSuppliers[]>;
  purchaseMaterials(items: PurchaseMaterialInput[]): Promise<void>;
}
