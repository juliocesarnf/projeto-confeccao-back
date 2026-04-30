export interface MaterialRepositoryInterface {
  findAllVariations(): Promise<any[]>;
  decrementStockByVariationId(variationId: number, quantity: number): Promise<void>;
}