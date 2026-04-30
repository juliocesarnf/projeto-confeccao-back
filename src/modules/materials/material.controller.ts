import type { Request, Response } from "express";
import { MaterialService, type MaterialVariationInfo } from "./material.service.js";
import { MaterialRepositoryPg } from "./material.repository.pg.js";

const repositorPg = new MaterialRepositoryPg;
const service = new MaterialService(repositorPg);

export class MaterialController {
  async getVariations(req: Request, res: Response) {
    let data = await service.findAllVariations();
    return res.json(data);
  }

  async removeStockVariations(req: Request, res: Response) {
    try {
      const variations: MaterialVariationInfo[] = req.body;
      await service.removeStockVariations(variations);
      return res.status(200).json({ message: "Estoque removido com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao remover estoque" });
    }
  }
}