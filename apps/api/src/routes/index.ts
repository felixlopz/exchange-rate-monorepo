import { Router, Request, Response } from "express";
import ratesRouter from "./rates";
import binanceRouter from "./binance";

const router = Router();

router.use("/rates", ratesRouter);
router.use("/binance", binanceRouter);

// Health check
router.get("/health", (req: Request, res: Response) => {
  // TEMP: find Railway proxy hop count for trust proxy. Remove after.
  console.log("[proxy-debug]", JSON.stringify({ xff: req.headers["x-forwarded-for"], realIp: req.headers["x-real-ip"], ip: req.ip, ips: req.ips }));
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
