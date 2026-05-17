import type { Request, Response } from "express";
import { ProductionRepositoryPg } from "./production.repository.pg.js";
import { ProductionService } from "./production.service.js";
import type { CreateProductionInput } from "./production.repository.intreface.js";

const repositoryPg = new ProductionRepositoryPg();
const service = new ProductionService(repositoryPg);

export class ProductionController {
  async get(req: Request, res: Response) {
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

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    console.log("id recebido:", id, "convertido:", Number(id));
    const data = await service.getProductionById(Number(id));
    console.log("data:", data);
    return res.json(data);
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
