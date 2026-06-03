import type { Request, Response } from "express";
import { ReportRepositoryPg } from "./report.repository.pg.js";
import { ReportService } from "./report.service.js";

const repositoryPg = new ReportRepositoryPg();
const service = new ReportService(repositoryPg);

export class ReportController {
  async getAllReports(req: Request, res: Response) {
    const data = await service.getAllReports();
    return res.json(data);
  }
}
