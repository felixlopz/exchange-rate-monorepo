import { BaseProvider } from "../providers/BaseProvider";
import { BCVProvider } from "../providers/BCVProvider";
import { BinanceProvider } from "../providers/BinanceProvider";
import { ScraperResult } from "../types";

class ScraperService {
  private providers: BaseProvider[];

  constructor() {
    this.providers = [new BCVProvider(), new BinanceProvider()];
  }

  async scrapeAll(): Promise<ScraperResult[]> {
    const results: ScraperResult[] = [];

    for (const provider of this.providers) {
      try {
        console.log(`📡 Scraping from ${provider.name}...`);
        const rates = await provider.fetchRates();
        results.push({
          provider: provider.name,
          success: true,
          rates,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`❌ Failed to scrape ${provider.name}:`, errorMessage);
        results.push({
          provider: provider.name,
          success: false,
          error: errorMessage,
        });
      }
    }

    return results;
  }

  async scrapeProvider(providerName: string): Promise<any[]> {
    const provider = this.providers.find((p) => p.name === providerName);

    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    return await provider.fetchRates();
  }

  getAvailableProviders(): string[] {
    return this.providers.map((p) => p.name);
  }
}

export default new ScraperService();
