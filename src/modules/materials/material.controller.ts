import type { Request, Response } from "express";
import { MaterialService } from "./material.service.js";
import { MaterialRepositoryPg } from "./material.repository.pg.js";
import type { MaterialVariationInfo, PurchaseMaterialInput, RequiredMaterialInput } from "../../types/material.js";

const repositorPg = new MaterialRepositoryPg;
const service = new MaterialService(repositorPg);

export class MaterialController {
  async getVariations(req: Request, res: Response) {
    let data = await service.getAllVariations();
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

  async getRequiredMaterialsSuppliers(req: Request, res: Response) {
    const payload = req.body;

    if (!Array.isArray(payload)) {
      return res.status(400).json({ error: "body deve ser um array" });
    }

    const materials: RequiredMaterialInput[] = payload.map((material) => ({
      materialId: Number(material.materialId),
      variationId: Number(material.variationId),
      material: material.material,
      variation: material.variation,
      quantity: Number(material.quantity),
      baseUnit: material.baseUnit,
    }));

    const hasInvalidMaterial = materials.some((material) => (
      !Number.isInteger(material.variationId) ||
      material.variationId <= 0 ||
      !Number.isInteger(material.materialId) ||
      material.materialId <= 0 ||
      Number.isNaN(material.quantity)
    ));

    if (hasInvalidMaterial) {
      return res.status(400).json({ error: "materiais invalidos" });
    }

    const data = await service.getRequiredMaterialsSuppliers(materials);
    return res.json(data);
  }
}
