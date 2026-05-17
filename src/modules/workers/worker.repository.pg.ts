import { db } from "../../database/db.js";
import type { WorkerRepositoryInterface } from "./worker.repository.interface.js";

export class WorkerRepositoryPg implements WorkerRepositoryInterface {

  async getAllWorkers(): Promise<any[]> {
    const result = await db.query(`
      SELECT
        id,
        name,
        active
      FROM worker
      ORDER BY name
    `);

    return result.rows;
  }

}