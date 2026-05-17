import type { Request, Response } from "express";
import { ProductService } from "./product.service.js";
import { ProductRepositoryPg } from "./product.repository.pg.js";
import { MaterialService } from "../materials/material.service.js";

const repositorPg = new ProductRepositoryPg()
const service = new ProductService(repositorPg);

export class ProductController {
  async get(req: Request, res: Response) {
    let data = await service.getAllVariations();
    return res.json(data);
  }

  async getAllVariations(req: Request, res: Response) {
    
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
    const { products } = req.body as { products: ProductToDo[] };
    const processes = await service.getProcessesByProductIdList(products);
    return res.json(processes);
  }

}

export type ProductToDo = {
  productId: number;
  name: string;
  quantity: number;
  processes?: ProductProcess[];
};

export type ProductProcess = {
  id: number;
  name: string;
};