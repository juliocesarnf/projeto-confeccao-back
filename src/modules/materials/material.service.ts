import type { MaterialRepositoryInterface } from "./material.repository.interface.js";

export type MaterialVariationInfo = {
  variacao_id: number;
  material: string;
  variacao: string;
  quantidade: number;
  unidade_base: string;
};

export class MaterialService {
  constructor(private readonly repository: MaterialRepositoryInterface) {}

  async findAllVariations() {
    return this.repository.findAllVariations();
  }

  async removeStockVariations(variations: MaterialVariationInfo[]) {
    for (const item of variations) {
      await this.repository.decrementStockByVariationId(item.variacao_id, item.quantidade);
    }
  }
}