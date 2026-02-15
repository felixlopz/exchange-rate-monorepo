import { Rate } from "../models/Rate";
import scraperService from "./scraperService";
import { ExchangeRate } from "../types";

class RateService {
  async updateRates(providerName?: string): Promise<ExchangeRate[]> {
    let scrapedData;

    if (providerName) {
      const rates = await scraperService.scrapeProvider(providerName);
      scrapedData = [{ provider: providerName, success: true, rates }];
    } else {
      scrapedData = await scraperService.scrapeAll();
    }

    const savedRates: ExchangeRate[] = [];

    for (const providerData of scrapedData) {
      if (!providerData.success || !providerData.rates) continue;

      for (const rate of providerData.rates) {
        const saved = await Rate.create(rate);
        savedRates.push(saved);
      }
    }

    return savedRates;
  }

  async getLatestRates(
    provider?: string,
    currency?: string,
  ): Promise<ExchangeRate[]> {
    return await Rate.getLatest(provider || null, currency || null);
  }

  async getHistoricalRates(
    currency: string,
    startDate: string,
    endDate: string,
    provider?: string,
  ): Promise<ExchangeRate[]> {
    return await Rate.getHistory(
      currency,
      startDate,
      endDate,
      provider || null,
    );
  }

  async getRatesByDate(
    date: string,
    provider?: string,
  ): Promise<ExchangeRate[]> {
    return await Rate.getByDate(date, provider || null);
  }
}

export default new RateService();
