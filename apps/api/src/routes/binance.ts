import { Router, Request, Response, NextFunction } from "express";
import binanceLiveService from "../services/binanceLiveService";
import rateService from "../services/rateService";

const router = Router();

// TODO: move this to utils
// Helper function to ensure query param is a string
const getStringParam = (param: unknown): string | undefined => {
  if (typeof param === "string") return param;
  if (Array.isArray(param) && param.length > 0) return param[0];
  return undefined;
};

// GET /api/binance/live - Get live Binance P2P rates (not stored)
router.get("/live", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = getStringParam(req.query.type) as
      | "buy"
      | "sell"
      | "average"
      | undefined;

    // Validate type parameter
    if (type && !["buy", "sell", "average"].includes(type)) {
      res.status(400).json({
        success: false,
        error: "Invalid type parameter. Must be: buy, sell, or average",
      });
      return;
    }

    const liveRates = await binanceLiveService.getLiveRates(type);

    res.json({
      success: true,
      data: liveRates,
      meta: {
        source: "binance_p2p_live",
        not_stored: true,
        info: "This data is fetched in real-time and not stored in the database",
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/binance/history - Get historical Binance rates from database
router.get(
  "/history",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tradeType = getStringParam(req.query.type); // 'buy' or 'sell'
      const startDate = getStringParam(req.query.startDate);
      const endDate = getStringParam(req.query.endDate);

      const start =
        startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      const end = endDate || new Date().toISOString().split("T")[0];

      // Fetch USDT rates from Binance_P2P provider
      const rates = await rateService.getHistoricalRates(
        "USDT",
        start,
        end,
        "Binance_P2P",
      );

      // Filter by trade type if specified
      let filteredRates = rates;
      if (tradeType && ["buy", "sell"].includes(tradeType.toLowerCase())) {
        filteredRates = rates.filter(
          (rate) => rate.update_type?.toUpperCase() === tradeType.toUpperCase(),
        );
      }

      res.json({
        success: true,
        data: filteredRates,
        meta: {
          currency: "USDT",
          startDate: start,
          endDate: end,
          provider: "Binance_P2P",
          trade_type: tradeType || "all",
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/binance/latest - Get latest stored Binance rates
router.get(
  "/latest",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tradeType = getStringParam(req.query.type); // 'buy' or 'sell'

      const rates = await rateService.getLatestRates("Binance_P2P", "USDT");

      // Filter by trade type if specified
      let filteredRates = rates;
      if (tradeType && ["buy", "sell"].includes(tradeType.toLowerCase())) {
        filteredRates = rates.filter(
          (rate) => rate.update_type?.toUpperCase() === tradeType.toUpperCase(),
        );
      }

      res.json({
        success: true,
        data: filteredRates,
        meta: {
          provider: "Binance_P2P",
          trade_type: tradeType || "all",
          source: "database",
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/binance/update - Manually trigger Binance scraping
router.post(
  "/update",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("🔄 Manual Binance P2P scrape triggered...");
      const rates = await rateService.updateRates("Binance_P2P");

      res.json({
        success: true,
        message: `Successfully scraped ${rates.length} Binance P2P rate(s)`,
        data: rates,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
