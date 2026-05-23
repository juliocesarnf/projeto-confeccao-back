import type { ReportRepositoryInterface } from "./report.repository.interface.js";

export class ReportService {
  constructor(private readonly repository: ReportRepositoryInterface) {}

  async getAll() {
    return this.repository.getAll();
  }
}
