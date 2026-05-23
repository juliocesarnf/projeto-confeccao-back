import { db } from "../database/db.js";
import type { CreateReportInput } from "../types/report.js";

export type { CreateReportInput } from "../types/report.js";

export class ReportRepository {
  async createIfMissing(input: CreateReportInput) {
    const existing = await db.query(
      `
      SELECT id
      FROM report
      WHERE type = $1
        AND entity_type = $2
        AND entity_id = $3
        AND status = 'pending'
      LIMIT 1
      `,
      [input.type, input.entityType, input.entityId]
    );

    if ((existing.rowCount ?? 0) > 0) {
      return;
    }

    await db.query(
      `
      INSERT INTO report (
        type,
        title,
        message,
        severity,
        status,
        entity_type,
        entity_id,
        metadata
      )
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

  async resolveRecovered(type: string, entityType: string, activeEntityIds: number[]) {
    if (activeEntityIds.length === 0) {
      await db.query(
        `
        UPDATE report
        SET status = 'resolved'
        WHERE type = $1
          AND entity_type = $2
          AND status = 'pending'
        `,
        [type, entityType]
      );

      return;
    }

    await db.query(
      `
      UPDATE report
      SET status = 'resolved'
      WHERE type = $1
        AND entity_type = $2
        AND status = 'pending'
        AND NOT (entity_id = ANY($3::int[]))
      `,
      [type, entityType, activeEntityIds]
    );
  }
}
