import type { WorkerRepositoryInterface } from "./worker.repository.interface.js";

export class WorkerService {
  constructor(private readonly repository: WorkerRepositoryInterface) {}

  async getAllWorkers() {
    return this.repository.getAllWorkers();
  }
}