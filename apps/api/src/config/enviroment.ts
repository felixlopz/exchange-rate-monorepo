import dotenv from "dotenv";

dotenv.config();

interface Config {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  RATE_LIMIT: {
    windowMs: number;
    maxRequests: number;
  };
}

const config: Config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  RATE_LIMIT: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },
};

export default config;
