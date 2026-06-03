export type MlOrderItem = {
  item: {
    id: string;
    title: string;
    seller_sku: string | null;
    variation_id: number | null;
  };
  quantity: number;
  unit_price: number;
  sale_fee: number;
};

export type MlBuyer = {
  id: number;
  nickname: string;
  first_name: string;
  last_name: string;
  phone: {
    area_code: string | null;
    number: string | null;
  };
};

export type MlOrder = {
  id: number;
  status: string;
  date_created: string;
  date_last_updated: string;
  total_amount: number;
  order_items: MlOrderItem[];
  buyer: MlBuyer;
};

export type MlOrdersSearchResult = {
  results: MlOrder[];
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
};

export type MlSkuMappingRow = {
  seller_sku: string;
  product_variation_id: number;
  quantity_per_unit: number;
};
