import { type Request, type Response } from "express";
import { EmployeeRepositoryPg } from "./employees.repository.pg.js";
import { EmployeeService } from "./employees.service.js";

export class EmployeesController {
  repository = new EmployeeRepositoryPg();
  service = new EmployeeService(this.repository);

  async getEmployees(req: Request, res: Response) {
    try {
      const employees = await this.service.getAllEmployees();
      return res.json(employees);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao obter funcionários" });
    }
  }
}