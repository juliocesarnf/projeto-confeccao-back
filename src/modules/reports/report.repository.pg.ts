import { db } from "../../database/db.js";
import type { ReportRepositoryInterface } from "./report.repository.interface.js";

export class ReportRepositoryPg implements ReportRepositoryInterface {
  async getAllReports(): Promise<any[]> {
    const result = await db.query(`
      SELECT
        id,
        type,
        title,
        message,
        severity,
        status,
        entity_type AS "entityType",
        entity_id AS "entityId",
        metadata,
        created_at AS "createdAt",
        read_at AS "readAt"
      FROM report
      ORDER BY created_at DESC
    `);

    return result.rows;
  }
}
