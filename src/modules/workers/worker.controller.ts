import { type Request, type Response } from "express";
import { WorkerRepositoryPg } from "./worker.repository.pg.js";
import { WorkerService } from "./worker.service.js";

export class WorkerController {
  repository = new WorkerRepositoryPg();
  service = new WorkerService(this.repository);

  async getWorkers(req: Request, res: Response) {
    try {
      const workers = await this.service.getAllWorkers();
      return res.json(workers);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao obter trabalhadores" });
    }
  }
}