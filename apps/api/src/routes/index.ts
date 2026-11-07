import { Router, Request, Response } from "express";
import ratesRouter from "./rates";
import binanceRouter from "./binance";

const router = Router();

router.use("/rates", ratesRouter);
router.use("/binance", binanceRouter);

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
