import { Pool, PoolConfig } from "pg";
import config from "./enviroment";

const poolConfig: PoolConfig = {
  connectionString: config.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};

export const pool = new Pool(poolConfig);

export const createTables = async (): Promise<void> => {
  const query = `
    CREATE TABLE IF NOT EXISTS exchange_rates (
      id SERIAL PRIMARY KEY,
      provider VARCHAR(50) NOT NULL,
      currency_from VARCHAR(10) NOT NULL,
      currency_to VARCHAR(10) DEFAULT 'VES',
      rate DECIMAL(20, 6) NOT NULL,
      update_type VARCHAR(10),
      scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date DATE NOT NULL,
      metadata JSONB,
      UNIQUE(provider, currency_from, currency_to, date, update_type)
    );

    CREATE INDEX IF NOT EXISTS idx_provider_date ON exchange_rates(provider, date);
    CREATE INDEX IF NOT EXISTS idx_currency_date ON exchange_rates(currency_from, date);
  `;

  try {
    await pool.query(query);
    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
};
