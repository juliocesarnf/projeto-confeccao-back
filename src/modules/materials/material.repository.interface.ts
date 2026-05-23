import type {
  RequiredMaterialInput,
  RequiredMaterialSuppliers,
  PurchaseMaterialInput,
} from "../../types/material.js";

export interface MaterialRepositoryInterface {
  getAllVariations(): Promise<any[]>;
  decrementStockByVariationId(variationId: number, quantity: number): Promise<void>;
  getRequiredMaterialsSuppliers(materials: RequiredMaterialInput[]): Promise<RequiredMaterialSuppliers[]>;
  purchaseMaterials(items: PurchaseMaterialInput[]): Promise<void>;
}
