import { Router, Request, Response, NextFunction } from "express";
import rateService from "../services/rateService";
import { validateDateRange } from "../middleware/validator";

const router = Router();

// Helper function to ensure query param is a string
const getStringParam = (param: unknown): string | undefined => {
  if (typeof param === "string") return param;
  if (Array.isArray(param) && param.length > 0) return param[0];
  return undefined;
};

// GET /api/rates/latest - Get latest rates
router.get(
  "/latest",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = getStringParam(req.query.provider);
      const currency = getStringParam(req.query.currency);
      const rates = await rateService.getLatestRates(
        provider as string,
        currency as string,
      );

      res.json({
        success: true,
        data: rates,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/rates/history - Get historical rates
router.get(
  "/history",
  validateDateRange,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currency = getStringParam(req.query.currency);
      const startDate = getStringParam(req.query.startDate);
      const endDate = getStringParam(req.query.endDate);
      const provider = getStringParam(req.query.provider);

      if (!currency) {
        res.status(400).json({
          success: false,
          error: "currency parameter is required",
        });
        return;
      }

      const start =
        (startDate as string) ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      const end = (endDate as string) || new Date().toISOString().split("T")[0];

      const rates = await rateService.getHistoricalRates(
        currency as string,
        start,
        end,
        provider as string,
      );

      res.json({
        success: true,
        data: rates,
        meta: {
          currency,
          startDate: start,
          endDate: end,
          provider: provider || "all",
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/rates/date/:date - Get rates for specific date
router.get(
  "/date/:date",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const date = getStringParam(req.params.date);
      const provider = getStringParam(req.query.provider);

      if (!date) {
        res.status(400).json({
          success: false,
          error: "date parameter is required",
        });
        return;
      }
      const rates = await rateService.getRatesByDate(date, provider as string);

      res.json({
        success: true,
        data: rates,
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/rates/update - Manually trigger rate update
router.post(
  "/update",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { provider } = req.body;
      const rates = await rateService.updateRates(provider);

      res.json({
        success: true,
        message: "Rates updated successfully",
        data: rates,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
