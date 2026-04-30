import type { EmployeeRepositoryInterface } from "./employees.repository.interface.js";

export class EmployeeService {
  constructor(private readonly repository: EmployeeRepositoryInterface) {}

  async getAllEmployees() {
    return this.repository.findAllEmployees();
  }
}