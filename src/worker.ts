import { startOperationalAlertsJob, stopOperationalAlertsJob } from "./jobs/operational-alerts.job.js";
import { db } from "./database/db.js";

startOperationalAlertsJob();

async function shutdown(signal: string) {
  console.log(`Worker received ${signal}. Shutting down...`);

  stopOperationalAlertsJob();
  await db.end();

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
