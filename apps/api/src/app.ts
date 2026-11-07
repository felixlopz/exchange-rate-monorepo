import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app: Express = express();

// Railway routes requests through two proxies: the edge (adds the visitor's
// IP to X-Forwarded-For) and an internal hop (the socket peer). Trusting
// both makes req.ip the visitor's IP, so rate limiting is per visitor.
// Measured 2026-11-07: XFF = "<visitor>, <edge>", socket = internal proxy.
app.set("trust proxy", 2);

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use("/api/", limiter);

// Routes
app.use("/api", routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handling
app.use(errorHandler);

export default app;
