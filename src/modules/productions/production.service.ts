import type { ProductionRepositoryInterface } from "./production.repository.intreface.js";
import type {
  CreateProductionBatchInput,
  CreateProductionInput,
  CreateProductionItemInput,
} from "../../types/ProductionTypes.js";

export class ProductionService {
  constructor(private readonly repository: ProductionRepositoryInterface) {}

  async getProductions() {
    return this.repository.getAllProductions();
  }

  async addProduction(data: CreateProductionInput) {
    this.validateProduction(data);
    return this.repository.createProduction(data);
  }

  private validateProduction(data: CreateProductionInput) {
    if (!this.isPositiveInteger(data?.orderId)) {
      throw new Error("orderId deve ser um número inteiro positivo.");
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("items deve ser um array com pelo menos um item.");
    }

    if (!Array.isArray(data.batches) || data.batches.length === 0) {
      throw new Error("batches deve ser um array com pelo menos um lote.");
    }

    data.items.forEach((item, index) => this.validateItem(item, index));
    this.validateUniqueProductVariations(data.items);
    data.batches.forEach((batch, index) => this.validateBatch(batch, index, data.items));
  }

  private validateItem(item: CreateProductionItemInput, index: number) {
    if (!this.isPositiveInteger(item?.orderItemId)) {
      throw new Error(`items[${index}].orderItemId deve ser um número inteiro positivo.`);
    }

    if (!this.isPositiveInteger(item?.productVariationId)) {
      throw new Error(`items[${index}].productVariationId deve ser um número inteiro positivo.`);
    }

    if (!this.isPositiveInteger(item?.plannedQuantity)) {
      throw new Error(`items[${index}].plannedQuantity deve ser um número inteiro positivo.`);
    }
  }

  private validateBatch(
    batch: CreateProductionBatchInput,
    batchIndex: number,
    productionItems: CreateProductionItemInput[]
  ) {
    if (!this.isPositiveInteger(batch?.processId)) {
      throw new Error(`batches[${batchIndex}].processId deve ser um número inteiro positivo.`);
    }

    if (!this.isPositiveInteger(batch?.stepOrder)) {
      throw new Error(`batches[${batchIndex}].stepOrder deve ser um número inteiro positivo.`);
    }

    if (!Array.isArray(batch.workers) || batch.workers.length === 0) {
      throw new Error(`batches[${batchIndex}].workers deve ter pelo menos um funcionário.`);
    }

    batch.workers.forEach((workerId, workerIndex) => {
      if (!this.isPositiveInteger(workerId)) {
        throw new Error(
          `batches[${batchIndex}].workers[${workerIndex}] deve ser um número inteiro positivo.`
        );
      }
    });

    if (new Set(batch.workers).size !== batch.workers.length) {
      throw new Error(`batches[${batchIndex}].workers nao pode repetir funcionarios.`);
    }

    if (!Array.isArray(batch.items) || batch.items.length === 0) {
      throw new Error(`batches[${batchIndex}].items deve ter pelo menos um item.`);
    }

    const availableVariationIds = new Set(
      productionItems.map(item => item.productVariationId)
    );

    batch.items.forEach((item, itemIndex) => {
      if (!this.isPositiveInteger(item?.productVariationId)) {
        throw new Error(
          `batches[${batchIndex}].items[${itemIndex}].productVariationId deve ser um número inteiro positivo.`
        );
      }

      if (!availableVariationIds.has(item.productVariationId)) {
        throw new Error(
          `batches[${batchIndex}].items[${itemIndex}].productVariationId não existe em items.`
        );
      }

      if (!this.isPositiveInteger(item?.quantity)) {
        throw new Error(
          `batches[${batchIndex}].items[${itemIndex}].quantity deve ser um número inteiro positivo.`
        );
      }
    });
  }

  private validateUniqueProductVariations(items: CreateProductionItemInput[]) {
    const variationIds = new Set<number>();

    for (const item of items) {
      if (variationIds.has(item.productVariationId)) {
        throw new Error(
          "items não pode repetir productVariationId, pois os lotes usam productVariationId para vincular production_item."
        );
      }

      variationIds.add(item.productVariationId);
    }
  }

  private isPositiveInteger(value: unknown): value is number {
    return Number.isInteger(value) && Number(value) > 0;
  }

  async getProductionByOrderId(id: number) {
    if (!this.isPositiveInteger(id)) {
      throw new Error("id deve ser um número inteiro positivo.");
    }

    return this.repository.getProductionByOrderId(id);
  }

  async updateBatchStatus(batchId: number, completed: boolean) {
    if (!this.isPositiveInteger(batchId)) {
      throw new Error("batchId deve ser um número inteiro positivo.");
    }

    if (typeof completed !== "boolean") {
      throw new Error("completed deve ser um booleano.");
    }

    await this.repository.updateBatchStatus(batchId, completed);
  }

  async fulfillItems(orderId: number, itemIds: number[]) {
    if (!this.isPositiveInteger(orderId)) {
      throw new Error("orderId deve ser um numero inteiro positivo.");
    }

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      throw new Error("itemIds deve ser um array com pelo menos um item.");
    }

    const uniqueItemIds = [...new Set(itemIds)];

    uniqueItemIds.forEach((itemId, index) => {
      if (!this.isPositiveInteger(itemId)) {
        throw new Error(`itemIds[${index}] deve ser um numero inteiro positivo.`);
      }
    });

    await this.repository.fulfillItems(orderId, uniqueItemIds);
  }
}
