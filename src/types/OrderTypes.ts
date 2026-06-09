export type OrderStatus = 'novo' | 'confirmado' | 'em_producao' | 'finalizado';

export type Order = {
  id: number;
  createdAt: Date;
  status: OrderStatus;
  totalValue: string;
  dueDate: Date;
  enoughItems: boolean;
  isFromMl: boolean;
  customerName: string;
  totalItems: string;
  totalQuantity: string;
};

export type OrderItemProduct = {
  id: number;
  name: string;
};

export type OrderItemVariation = {
  id: number;
  size: string;
  color: string;
  sku: string;
};

export type OrderItem = {
  id: number;
  quantity: number;
  unitPrice: string;
  fulfilledQuantity: number;
  status: string;
  product: OrderItemProduct;
  variation: OrderItemVariation;
};

export type ConfirmedOrder = {
  id: number;
  createdAt: Date;
  status: OrderStatus;
  totalValue: string;
  dueDate: Date;
  enoughItems: boolean;
};

export type CreateOrderInput = {
  customerId: number;
  dueDate: string;
  items?: { variationId: number; quantity: number }[];
};
