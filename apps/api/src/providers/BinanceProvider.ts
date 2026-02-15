import axios from "axios";
import { BaseProvider } from "./BaseProvider";
import { BinanceOffer, BinanceResponse, RateData } from "../types";

export class BinanceProvider extends BaseProvider {
  private readonly apiUrl: string;

  constructor() {
    super("Binance_P2P");
    this.apiUrl = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
  }

  async fetchRates(): Promise<RateData[]> {
    const rates: RateData[] = [];

    try {
      // Fetch BUY offers (when users are buying USDT, selling VES)
      const buyOffers = await this.fetchOffers("BUY");
      const buyRate = this.calculateAverageRate(buyOffers);

      if (buyRate) {
        rates.push(
          this.normalizeRate("USDT", "VES", buyRate, "BUY", {
            sample_size: Math.min(10, buyOffers.length),
            price_range: this.getPriceRange(buyOffers),
            top_price: buyOffers[0] ? parseFloat(buyOffers[0].adv.price) : null,
            offers_count: buyOffers.length,
          }),
        );
      }

      // Fetch SELL offers (when users are selling USDT, buying VES)
      const sellOffers = await this.fetchOffers("SELL");
      const sellRate = this.calculateAverageRate(sellOffers);

      if (sellRate) {
        rates.push(
          this.normalizeRate("USDT", "VES", sellRate, "SELL", {
            sample_size: Math.min(10, sellOffers.length),
            price_range: this.getPriceRange(sellOffers),
            top_price: sellOffers[0]
              ? parseFloat(sellOffers[0].adv.price)
              : null,
            offers_count: sellOffers.length,
          }),
        );
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

  private async fetchOffers(
    tradeType: "BUY" | "SELL",
  ): Promise<BinanceOffer[]> {
    const requestBody = {
      additionalKycVerifyFilter: 0,
      asset: "USDT",
      fiat: "VES",
      tradeType,
      filterType: "tradeable",
      classifies: ["profession", "fiat_trade"],
      countries: [],
      payTypes: [],
      periods: [],
      proMerchantAds: false,
      publisherType: "merchant",
      followed: false,
      page: 1,
      rows: 10,
    };

    const response = await axios.post<BinanceResponse>(
      this.apiUrl,
      requestBody,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    );

    if (!response.data.success || response.data.code !== "000000") {
      throw new Error(`Binance API returned error: ${response.data.code}`);
    }

    // Filter for merchants only for reliability
    return response.data.data.filter(
      (offer) => offer.advertiser.userType === "merchant",
    );
  }

  private calculateAverageRate(offers: BinanceOffer[]): number | null {
    if (offers.length === 0) {
      console.warn("No offers available to calculate rate");
      return null;
    }

    // Take top 10 offers (or less if not enough available)
    const topOffers = offers.slice(0, 10);
    const prices = topOffers.map((offer) => parseFloat(offer.adv.price));

    // Calculate simple average
    const sum = prices.reduce((acc, price) => acc + price, 0);
    const average = sum / prices.length;

    return average;
  }

  private getPriceRange(
    offers: BinanceOffer[],
  ): { min: number; max: number } | null {
    if (offers.length === 0) return null;

    const topOffers = offers.slice(0, 10);
    const prices = topOffers.map((offer) => parseFloat(offer.adv.price));

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }
}
