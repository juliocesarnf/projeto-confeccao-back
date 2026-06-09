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
  completed: boolean;
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

export interface ProductionBatchWorkerView {
  workerId: number;
  workerName: string;
  role: string | null;
  startDate: string | null;
  endDate: string | null;
  producedQuantity: number;
}

export interface ProductionBatchView {
  batchId: number;
  processId: number;
  processName: string;
  stepOrder: number | null;
  completed: boolean;
  startDate: string | null;
  endDate: string | null;
  workers: ProductionBatchWorkerView[];
}

export interface OrderItemView {
  orderItemId: number;
  productVariationId: number;
  productName: string;
  variationSku: string;
  quantity: number;
  fulfilledQuantity: number;
  status: "pendente" | "parcial" | "atendido";
  batches: ProductionBatchView[];
}

export type ProductionDelayRiskOptions = {
  minutesPer50Units: number;
};

export type ProductionStaticRiskRow = {
  production_id: number;
  order_id: number;
  due_date: string;
  customer_name: string;
  expect_end_date: string;
  expect_dificulty: number;
  days_over: number;
};

export type ProductionDynamicRiskRow = {
  production_id: number;
  order_id: number;
  due_date: string;
  customer_name: string;
  remaining_difficulty: number;
  remaining_with_margin: number;
  remaining_batches: number;
  total_batches: number;
  estimated_end_date: string;
  days_over: number;
};

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
