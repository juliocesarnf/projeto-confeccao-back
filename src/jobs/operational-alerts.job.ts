import { checkLowMaterialStock } from "./low-material-stock.js";
import { checkLowProductStock } from "./low-product-stock.js";
import { checkProductionDelayRisk } from "./production-delay-risk.js";

type OperationalAlertsJobOptions = {
  intervalMinutes?: number;
  lookbackDays?: number;
  coverageWeeks?: number;
  minutesPer50Units?: number;
  runImmediately?: boolean;
};

const DEFAULT_INTERVAL_MINUTES = 10;
const DEFAULT_LOOKBACK_DAYS = 28;
const DEFAULT_COVERAGE_WEEKS = 1;
const DEFAULT_MINUTES_PER_50_UNITS = 30;

let interval: NodeJS.Timeout | null = null;
let running = false;

export function startOperationalAlertsJob(options: OperationalAlertsJobOptions = {}) {
  const config = {
    intervalMinutes: options.intervalMinutes ?? readNumberEnv("OPERATIONAL_ALERTS_INTERVAL_MINUTES", DEFAULT_INTERVAL_MINUTES),
    lookbackDays: options.lookbackDays ?? readNumberEnv("STOCK_ALERT_LOOKBACK_DAYS", DEFAULT_LOOKBACK_DAYS),
    coverageWeeks: options.coverageWeeks ?? readNumberEnv("STOCK_ALERT_COVERAGE_WEEKS", DEFAULT_COVERAGE_WEEKS),
    minutesPer50Units: options.minutesPer50Units ?? readNumberEnv("DIFFICULTY_MINUTES_PER_UNIT", DEFAULT_MINUTES_PER_50_UNITS),
    runImmediately: options.runImmediately ?? true,
  };

  if (interval) {
    return;
  }

  const intervalMs = config.intervalMinutes * 60 * 1000;

  if (config.runImmediately) {
    void runOperationalAlerts(config.lookbackDays, config.coverageWeeks, config.minutesPer50Units);
  }

  interval = setInterval(() => {
    void runOperationalAlerts(config.lookbackDays, config.coverageWeeks, config.minutesPer50Units);
  }, intervalMs);

  console.log(
    `Operational alerts job started. interval=${config.intervalMinutes}min lookback=${config.lookbackDays}days coverage=${config.coverageWeeks}weeks difficultyMinutes=${config.minutesPer50Units}min`
  );
}

export function stopOperationalAlertsJob() {
  if (!interval) {
    return;
  }

  clearInterval(interval);
  interval = null;
}

async function runOperationalAlerts(lookbackDays: number, coverageWeeks: number, minutesPer50Units: number) {
  if (running) {
    console.log("Operational alerts job skipped because the previous execution is still running.");
    return;
  }

  running = true;

  try {
    const stockOptions = { lookbackDays, coverageWeeks };
    const [lowProducts, lowMaterials, delayRisks] = await Promise.all([
      checkLowProductStock(stockOptions),
      checkLowMaterialStock(stockOptions),
      checkProductionDelayRisk({ minutesPer50Units }),
    ]);

    console.log(
      `Operational alerts checked. lowProducts=${lowProducts.length} lowMaterials=${lowMaterials.length} productionDelayRisks=${delayRisks.length}`
    );
  } catch (error) {
    console.error("Operational alerts job failed.", error);
  } finally {
    running = false;
  }
}

function readNumberEnv(name: string, fallback: number) {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
