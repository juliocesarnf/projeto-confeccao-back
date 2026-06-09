import type { Request, Response } from "express";
import { MaterialService } from "./material.service.js";
import { MaterialRepositoryPg } from "./material.repository.pg.js";
import type { MaterialVariationInfo, PurchaseMaterialInput, RequiredMaterialInput } from "../../types/MaterialTypes.js";

const repositorPg = new MaterialRepositoryPg;
const service = new MaterialService(repositorPg);

export class MaterialController {
  async getAllMaterials(_req: Request, res: Response) {
    const data = await service.getAllMaterials();
    return res.json(data);
  }

  async createMaterial(req: Request, res: Response) {
    const body = req.body as { name: string; baseUnit: string; quantityPerPackage?: number };
    const data = await service.createMaterial(body);
    return res.status(201).json(data);
  }

  async getVariations(_req: Request, res: Response) {
    let data = await service.getAllVariations();
    return res.json(data);
  }

  async updateVariation(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { variation, stock } = req.body as { variation: string; stock: number };
    const data = await service.updateVariation(id, variation, stock);
    return res.json(data);
  }

  async getVariationsByMaterialId(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await service.getVariationsByMaterialId(id);
    return res.json(data);
  }

  async removeStockVariations(req: Request, res: Response) {
    try {
      const payload = req.body;

      if (!Array.isArray(payload)) {
        return res.status(400).json({ error: "body deve ser um array" });
      }

      const variations: MaterialVariationInfo[] = payload.map((item) => ({
        materialVariationId: Number(item.materialVariationId),
        quantity: Number(item.quantity),
      }));

      const hasInvalid = variations.some(
        (item) =>
          !Number.isInteger(item.materialVariationId) ||
          item.materialVariationId <= 0 ||
          Number.isNaN(item.quantity) ||
          item.quantity <= 0
      );

      if (hasInvalid) {
        return res.status(400).json({ error: "itens inválidos" });
      }

      await service.removeStockVariations(variations);
      return res.status(200).json({ message: "Estoque removido com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao remover estoque" });
    }
  }

  async purchaseMaterials(req: Request, res: Response) {
    try {
      const payload = req.body;

      if (!Array.isArray(payload)) {
        return res.status(400).json({ error: "body deve ser um array" });
      }

      const items: PurchaseMaterialInput[] = payload.map((item) => ({
        materialVariationId: Number(item.materialVariationId),
        quantity: Number(item.quantity),
      }));

      const hasInvalid = items.some(
        (item) =>
          !Number.isInteger(item.materialVariationId) ||
          item.materialVariationId <= 0 ||
          Number.isNaN(item.quantity) ||
          item.quantity <= 0
      );

      if (hasInvalid) {
        return res.status(400).json({ error: "itens inválidos" });
      }

      await service.purchaseMaterials(items);
      return res.status(200).json({ message: "Estoque atualizado com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar estoque" });
    }
  }

  async addStockPack(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "id inválido" });
      }
      const data = await service.addStockPack(id);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao adicionar pacote ao estoque" });
    }
  }

  async removeStockPack(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "id inválido" });
      }
      const data = await service.removeStockPack(id);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao remover pacote do estoque" });
    }
  }

  async getRequiredMaterialsSuppliers(req: Request, res: Response) {
    const payload = req.body;

    if (!Array.isArray(payload)) {
      return res.status(400).json({ error: "body deve ser um array" });
    }

    const materials: RequiredMaterialInput[] = payload.map((material) => ({
      materialId: Number(material.materialId),
    }));

    const hasInvalidMaterial = materials.some((material) => (
      !Number.isInteger(material.materialId) ||
      material.materialId <= 0
    ));

    if (hasInvalidMaterial) {
      return res.status(400).json({ error: "materiais invalidos" });
    }

    const data = await service.getRequiredMaterialsSuppliers(materials);
    return res.json(data);
  }
}
