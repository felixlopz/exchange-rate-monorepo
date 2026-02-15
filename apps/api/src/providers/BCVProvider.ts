import axios from "axios";
import * as cheerio from "cheerio";
import { BaseProvider } from "./BaseProvider";
import { RateData } from "../types";
import https from "https";

export class BCVProvider extends BaseProvider {
  private readonly url: string;

  constructor() {
    super("BCV");
    this.url = "https://www.bcv.org.ve/";
  }

  async fetchRates(): Promise<RateData[]> {
    try {
      const response = await axios.get(this.url, {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });

      const $ = cheerio.load(response.data);
      const rates: RateData[] = [];

      // Extract rates (adjust selectors based on actual page structure)
      const usdRate = this.extractRate($, "dolar");
      const eurRate = this.extractRate($, "euro");

      const currentHour = new Date().getHours();
      const updateType = currentHour < 13 ? "AM" : "PM";

      if (usdRate) {
        rates.push(this.normalizeRate("USD", "VES", usdRate, updateType));
      }

      if (eurRate) {
        rates.push(this.normalizeRate("EUR", "VES", eurRate, updateType));
      }

      return rates;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Error fetching from ${this.name}:`, errorMessage);
      throw new Error(
        `Failed to fetch rates from ${this.name}: ${errorMessage}`,
      );
    }
  }

  private extractRate($: cheerio.CheerioAPI, divId: string): number | null {
    try {
      // Find the div by ID (e.g., #euro or #dolar)
      const rateText = $(`#${divId} .centrado strong`).first().text().trim();

      if (!rateText) {
        console.warn(`No rate found for ${divId}`);
        return null;
      }

      // Remove spaces and convert comma to dot for decimal parsing
      const cleanedRate = rateText.replace(/\s/g, "").replace(",", ".");
      const rate = parseFloat(cleanedRate);

      if (isNaN(rate)) {
        console.warn(`Invalid rate format for ${divId}: ${rateText}`);
        return null;
      }

      return rate;
    } catch (error) {
      console.error(`Error extracting rate for ${divId}:`, error);
      return null;
    }
  }
}
