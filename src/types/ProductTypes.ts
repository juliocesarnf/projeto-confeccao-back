export type Product = {
  id: number;
  name: string;
  description?: string;
  category?: string;
  active: boolean;
};

export type ProductProcess = {
  id: number;
  name: string;
  processId: number;
  stepOrder: number;
  dificultyLevel: number;
};

export type ProductProcessesResult = {
  productId: number;
  processes: ProductProcess[];
};

export type ProductVariation = {
  id: number;
  size: string | null;
  color: string | null;
  stock: number;
  productId: number;
};

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
