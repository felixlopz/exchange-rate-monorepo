import cron from "node-cron";
import rateService from "../services/rateService";

// BCV Jobs - 9:01 AM and 1:01 PM Caracas time
const bcvMorningJob = cron.schedule(
  "1 9 * * *",
  async () => {
    console.log("🕐 Running BCV morning scrape job...");
    try {
      await rateService.updateRates("BCV");
      console.log("✅ BCV morning scrape completed");
    } catch (error) {
      console.error("❌ BCV morning scrape failed:", error);
    }
  },
  {
    timezone: "America/Caracas",
  },
);

const bcvAfternoonJob = cron.schedule(
  "1 13 * * *",
  async () => {
    console.log("🕐 Running BCV afternoon scrape job...");
    try {
      await rateService.updateRates("BCV");
      console.log("✅ BCV afternoon scrape completed");
    } catch (error) {
      console.error("❌ BCV afternoon scrape failed:", error);
    }
  },
  {
    timezone: "America/Caracas",
  },
);

// BCV publishes the reference rate late afternoon (forward-dated to the next
// banking day). The 9:01/13:01 runs fire before it, so the new rate was not
// captured until the next morning. Scrape hourly 15:01–20:01 to bracket the
// publish window. Idempotent upsert makes repeat runs cheap.
const bcvEveningJob = cron.schedule(
  "1 15-20 * * *",
  async () => {
    console.log("🕐 Running BCV evening scrape job...");
    try {
      await rateService.updateRates("BCV");
      console.log("✅ BCV evening scrape completed");
    } catch (error) {
      console.error("❌ BCV evening scrape failed:", error);
    }
  },
  {
    timezone: "America/Caracas",
  },
);

// Binance P2P Jobs - 3x daily (9 AM, 1 PM, 6 PM Caracas time)
const binanceMorningJob = cron.schedule(
  "0 9 * * *",
  async () => {
    console.log("🕐 Running Binance P2P morning scrape job...");
    try {
      await rateService.updateRates("Binance_P2P");
      console.log("✅ Binance P2P morning scrape completed");
    } catch (error) {
      console.error("❌ Binance P2P morning scrape failed:", error);
    }
  },
  {
    timezone: "America/Caracas",
  },
);

const binanceAfternoonJob = cron.schedule(
  "0 13 * * *",
  async () => {
    console.log("🕐 Running Binance P2P afternoon scrape job...");
    try {
      await rateService.updateRates("Binance_P2P");
      console.log("✅ Binance P2P afternoon scrape completed");
    } catch (error) {
      console.error("❌ Binance P2P afternoon scrape failed:", error);
    }
  },
  {
    timezone: "America/Caracas",
  },
);

const binanceEveningJob = cron.schedule(
  "0 18 * * *",
  async () => {
    console.log("🕐 Running Binance P2P evening scrape job...");
    try {
      await rateService.updateRates("Binance_P2P");
      console.log("✅ Binance P2P evening scrape completed");
    } catch (error) {
      console.error("❌ Binance P2P evening scrape failed:", error);
    }
  },
  {
    timezone: "America/Caracas",
  },
);

export const startScheduler = (): void => {
  bcvMorningJob.start();
  bcvAfternoonJob.start();
  bcvEveningJob.start();
  binanceMorningJob.start();
  binanceAfternoonJob.start();
  binanceEveningJob.start();
  console.log("⏰ Scheduler started:");
  console.log("  - BCV: 9:01 AM, 1:01 PM, and hourly 3:01–8:01 PM Caracas time");
  console.log("  - Binance P2P: 9:00 AM, 1:00 PM, and 6:00 PM Caracas time");
};

export const stopScheduler = (): void => {
  bcvMorningJob.stop();
  bcvAfternoonJob.stop();
  bcvEveningJob.stop();
  binanceMorningJob.stop();
  binanceAfternoonJob.stop();
  binanceEveningJob.stop();
  console.log("⏰ Scheduler stopped");
};
