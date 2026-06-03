import type { Request, Response } from "express";
import { ProductionRepositoryPg } from "./production.repository.pg.js";
import { ProductionService } from "./production.service.js";
import type { CreateProductionInput } from "../../types/ProductionTypes.js";

const repositoryPg = new ProductionRepositoryPg();
const service = new ProductionService(repositoryPg);

export class ProductionController {
  async getProductions(req: Request, res: Response) {
    const data = await service.getProductions();
    return res.json(data);
  }

  async addProduction(req: Request, res: Response) {
    try {
      const data = await service.addProduction(req.body as CreateProductionInput);
      return res.status(201).json(data);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Erro ao adicionar produção.";
      console.log(error);

      return res.status(400).json({ error: message });
    }
  }

  async getProductionByOrderId(req: Request, res: Response) {
    const { id } = req.params;
    console.log("id recebido:", id, "convertido:", Number(id));
    const data = await service.getProductionByOrderId(Number(id));
    console.log("data:", data);
    return res.json(data);
  }

  async updateBatchStatus(req: Request, res: Response) {
    try {
      const batchId = Number(req.params.batchId);
      const { completed } = req.body as { completed?: boolean };

      await service.updateBatchStatus(batchId, completed as boolean);

      return res.status(204).send();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Erro ao atualizar status do lote.";

      return res.status(400).json({ error: message });
    }
  }

  async fulfillItem(req: Request, res: Response) {
    try {
      const orderId = Number(req.params.orderId);
      const { itemIds } = req.body as { itemIds?: number[] };

      await service.fulfillItems(orderId, itemIds ?? []);

      return res.status(204).send();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Erro ao marcar itens como atendidos.";

      return res.status(400).json({ error: message });
    }
  }
}
