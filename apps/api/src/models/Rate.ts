import { pool } from "../config/database";
import { RateData, ExchangeRate } from "../types";

export class Rate {
  static async create(rateData: RateData): Promise<ExchangeRate> {
    const query = `
      INSERT INTO exchange_rates 
        (provider, currency_from, currency_to, rate, update_type, date, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (provider, currency_from, currency_to, date, update_type) 
      DO UPDATE SET 
        rate = EXCLUDED.rate,
        scraped_at = CURRENT_TIMESTAMP,
        metadata = EXCLUDED.metadata
      RETURNING *
    `;

    const values = [
      rateData.provider,
      rateData.currency_from,
      rateData.currency_to,
      rateData.rate,
      rateData.update_type,
      rateData.date,
      JSON.stringify(rateData.metadata || {}),
    ];

    const result = await pool.query(query, values);
    return result.rows[0] as ExchangeRate;
  }

  static async getLatest(
    provider: string | null = null,
    currency: string | null = null,
  ): Promise<ExchangeRate[]> {
    let query = `
      SELECT DISTINCT ON (provider, currency_from) *
      FROM exchange_rates
      WHERE 1=1
    `;
    const params: any[] = [];

    if (provider) {
      params.push(provider);
      query += ` AND provider = $${params.length}`;
    }

    if (currency) {
      params.push(currency);
      query += ` AND currency_from = $${params.length}`;
    }

    query += ` ORDER BY provider, currency_from, scraped_at DESC`;

    const result = await pool.query(query, params);
    return result.rows as ExchangeRate[];
  }

  static async getHistory(
    currency: string,
    startDate: string,
    endDate: string,
    provider: string | null = null,
  ): Promise<ExchangeRate[]> {
    let query = `
      SELECT * FROM exchange_rates
      WHERE currency_from = $1
        AND date >= $2
        AND date <= $3
    `;
    const params: any[] = [currency, startDate, endDate];

    if (provider) {
      params.push(provider);
      query += ` AND provider = $${params.length}`;
    }

    query += ` ORDER BY date DESC, scraped_at DESC`;

    const result = await pool.query(query, params);
    return result.rows as ExchangeRate[];
  }

  static async getByDate(
    date: string,
    provider: string | null = null,
  ): Promise<ExchangeRate[]> {
    let query = `
      SELECT * FROM exchange_rates
      WHERE date = $1
    `;
    const params: any[] = [date];

    if (provider) {
      params.push(provider);
      query += ` AND provider = $${params.length}`;
    }

    query += ` ORDER BY scraped_at DESC`;

    const result = await pool.query(query, params);
    return result.rows as ExchangeRate[];
  }
}
