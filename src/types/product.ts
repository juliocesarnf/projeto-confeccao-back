export type ProductToDo = {
  productId: number;
  name: string;
  quantity: number;
  processes?: ProductProcess[];
};

export type ProductProcess = {
  id: number;
  name: string;
};

export interface ProductRepositoryInterface {
  getMaterialsForProductVariationId(id: number): Promise<any[]>;
  getAllVariations(): Promise<any[]>;
  getMaterialsByVariationIdList(ids: number[]): Promise<any[]>;
  getProcessesByProductIdList(products: ProductToDo[]): Promise<any[]>;
}

export type LowProductStockOptions = {
  lookbackDays: number;
  coverageWeeks: number;
};

export type LowProductStockRow = {
  id: number;
  productName: string;
  sku: string | null;
  size: string | null;
  color: string | null;
  stock: string;
  minimumStock: string;
  totalQuantity: string;
  weeklyUsage: string;
  recommendedMinimum: string;
};
