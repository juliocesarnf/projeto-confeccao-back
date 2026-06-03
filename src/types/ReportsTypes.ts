export type CreateReportInput = {
  type: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  entityType: string;
  entityId: number;
  metadata: Record<string, unknown>;
};

export interface ReportRepositoryInterface {
  getAll(): Promise<any[]>;
}
