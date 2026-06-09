import { db } from "../database/db.js";
import type { CreateReportInput } from "../types/ReportsTypes.js";

export type { CreateReportInput } from "../types/ReportsTypes.js";

export class ReportRepository {
  async upsertReport(input: CreateReportInput) {
    const updated = await db.query(
      `
      UPDATE report
      SET title    = $2,
          message  = $3,
          severity = $4,
          status   = 'pending',
          metadata = $7::jsonb
      WHERE type        = $1
        AND entity_type = $5
        AND entity_id   = $6
      `,
      [
        input.type,
        input.title,
        input.message,
        input.severity,
        input.entityType,
        input.entityId,
        JSON.stringify(input.metadata),
      ]
    );

    if ((updated.rowCount ?? 0) > 0) {
      return;
    }

    await db.query(
      `
      INSERT INTO report (type, title, message, severity, status, entity_type, entity_id, metadata)
      VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7::jsonb)
      `,
      [
        input.type,
        input.title,
        input.message,
        input.severity,
        input.entityType,
        input.entityId,
        JSON.stringify(input.metadata),
      ]
    );
  }

  async deleteRecovered(type: string, entityType: string, activeEntityIds: number[]) {
    if (activeEntityIds.length === 0) {
      await db.query(
        `DELETE FROM report WHERE type = $1 AND entity_type = $2`,
        [type, entityType]
      );
      return;
    }

    await db.query(
      `
      DELETE FROM report
      WHERE type        = $1
        AND entity_type = $2
        AND NOT (entity_id = ANY($3::int[]))
      `,
      [type, entityType, activeEntityIds]
    );
  }
}
