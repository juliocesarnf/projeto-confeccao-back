import type { ReportRepositoryInterface } from "./report.repository.interface.js";

export class ReportService {
  constructor(private readonly repository: ReportRepositoryInterface) {}

  async getAllReports() {
    return this.repository.getAllReports();
  }
}
