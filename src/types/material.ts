export type RequiredMaterialInput = {
  materialId: number;
  variationId: number;
  material: string;
  variation: string;
  quantity: number;
  baseUnit: string;
};

export type MaterialSupplierInfo = {
  supplierId: number;
  supplierName: string;
  price: number;
};

export type RequiredMaterialSuppliers = {
  materialId: number;
  materialName: string;
  suppliers: MaterialSupplierInfo[];
};

export type PurchaseMaterialInput = {
  materialVariationId: number;
  quantity: number;
};

export type MaterialVariationInfo = {
  variation_id: number;
  material: string;
  variation: string;
  quantity: number;
  base_unit: string;
};

export type LowMaterialStockOptions = {
  lookbackDays: number;
  coverageWeeks: number;
};

export type LowMaterialStockRow = {
  id: number;
  materialName: string;
  variation: string | null;
  baseUnit: string | null;
  stock: string;
  totalQuantity: string;
  weeklyUsage: string;
  recommendedMinimum: string;
};
