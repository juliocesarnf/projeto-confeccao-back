import { startOperationalAlertsJob, stopOperationalAlertsJob } from "./jobs/operational-alerts.job.js";
import { startMlOrderSyncJob, stopMlOrderSyncJob } from "./integrations/ml/ml-order-sync.js";
import { db } from "./database/db.js";

startOperationalAlertsJob();
startMlOrderSyncJob();

async function shutdown(signal: string) {
  console.log(`Worker received ${signal}. Shutting down...`);

  stopOperationalAlertsJob();
  stopMlOrderSyncJob();
  await db.end();

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
