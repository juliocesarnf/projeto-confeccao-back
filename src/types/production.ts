export type CreateProductionItemInput = {
  orderItemId: number;
  productVariationId: number;
  plannedQuantity: number;
};

export type CreateProductionBatchItemInput = {
  productVariationId: number;
  quantity: number;
};

export type CreateProductionBatchInput = {
  processId: number;
  stepOrder: number;
  workers: number[];
  items: CreateProductionBatchItemInput[];
};

export type CreateProductionInput = {
  orderId: number;
  items: CreateProductionItemInput[];
  batches: CreateProductionBatchInput[];
};

export type CreatedProductionItem = {
  id: number;
  orderItemId: number;
  productVariationId: number;
  plannedQuantity: number;
  producedQuantity: number;
  status: string;
};

export type CreatedProductionBatchItem = {
  id: number;
  productionItemId: number;
  productVariationId: number;
  quantity: number;
};

export type CreatedProductionBatchWorker = {
  id: number;
  workerId: number;
};

export type CreatedProductionBatch = {
  id: number;
  processId: number;
  stepOrder: number;
  status: string;
  items: CreatedProductionBatchItem[];
  workers: CreatedProductionBatchWorker[];
};

export type CreatedProduction = {
  id: number;
  orderId: number;
  status: string;
  startDate: string | null;
  expectedEndDate: string | null;
  expectDificulty: number;
  endDate: string | null;
  items: CreatedProductionItem[];
  batches: CreatedProductionBatch[];
};

export interface OrderItemView {
  orderItemId: number;
  productVariationId: number;
  productName: string;
  variationSku: string;
  quantity: number;
  fulfilledQuantity: number;
  status: "pendente" | "parcial" | "atendido";
}

export interface ProductionDetailView {
  order: {
    id: number;
    customerId: number;
    customerName: string;
    dueDate: string | null;
    createdAt: string;
    totalValue: number;
    status: string;
  };
  progress: {
    total: number;
    fulfilled: number;
    percentage: number;
  };
  items: {
    fulfilled: OrderItemView[];
    pending: OrderItemView[];
  };
}

export interface ProductionRepositoryInterface {
  getAllProductions(): Promise<any[]>;
  createProduction(data: CreateProductionInput): Promise<CreatedProduction>;
  getProductionById(id: number): Promise<ProductionDetailView | null>;
  fulfillItems(orderId: number, itemIds: number[]): Promise<void>;
}
