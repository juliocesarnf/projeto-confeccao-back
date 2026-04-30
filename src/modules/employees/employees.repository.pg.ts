import { db } from "../../database/db.js";
import type { EmployeeRepositoryInterface } from "./employees.repository.interface.js";

export class EmployeeRepositoryPg implements EmployeeRepositoryInterface {
  async findAllEmployees(): Promise<any[]> {
    // Simulação de consulta ao banco de dados PostgreSQL
    const result = await db.query(`
      SELECT id, nome, ativo 
      FROM costureiro
      ORDER BY nome
    `);
    return result.rows;
  }
}