import type { Request, Response } from "express";
import { ProductService } from "./product.service.js";
import { ProductRepositoryPg } from "./product.repository.pg.js";

const repositorPg = new ProductRepositoryPg()
const service = new ProductService(repositorPg);

export class ProductController {
  async getAllProducts(_req: Request, res: Response) {
    const data = await service.getAllProducts();
    return res.json(data);
  }

  async createProduct(req: Request, res: Response) {
    const body = req.body as { name: string; description?: string; category?: string; active: boolean };
    const data = await service.createProduct(body);
    return res.status(201).json(data);
  }

  async getProductVariations(_req: Request, res: Response) {
    let data = await service.getAllVariations();
    return res.json(data);
  }

  async updateVariation(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { size, color, stock } = req.body as { size: string | null; color: string | null; stock: number };
    const data = await service.updateVariation(id, { size, color, stock });
    return res.json(data);
  }

  async addStock(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await service.addStock(id);
    return res.json(data);
  }

  async removeStock(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await service.removeStock(id);
    return res.json(data);
  }

  async getVariationsByProductId(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await service.getVariationsByProductId(id);
    return res.json(data);
  }

  async getMaterialsForProductVariationId(req: Request, res: Response) {
    const id = Number(req.params.id);
    let data = await service.getMaterialsForProductVariationId(id);
    return res.json(data);
  }

  async getMaterialsByVariationIds(req: Request, res: Response) {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "ids deve ser um array" });
    }

    const materials = await service.getMaterialsByVariationIds(ids);

    return res.json(materials);
  }

  async getProcessesByProductIdList(req: Request, res: Response) {
    const { productIds } = req.body as { productIds: number[] };
    const processes = await service.getProcessesByProductIdList(productIds);
    return res.json(processes);
  }

}

