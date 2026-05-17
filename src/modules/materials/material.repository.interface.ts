export interface MaterialRepositoryInterface {
  getAllVariations(): Promise<any[]>;
  decrementStockByVariationId(variationId: number, quantity: number): Promise<void>;
}