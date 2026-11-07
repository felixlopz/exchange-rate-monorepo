import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app: Express = express();

// Railway puts one proxy in front of the app. Trust it so req.ip is the
// visitor's IP (from X-Forwarded-For) and rate limiting is per visitor,
// not one shared bucket for everyone.
app.set("trust proxy", 1);

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
