import axios from "axios";
import { BinanceOffer, BinanceResponse, LiveRateResponse } from "../types";

class BinanceLiveService {
  private readonly apiUrl =
    "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

  async getLiveRates(
    type?: "buy" | "sell" | "average",
  ): Promise<LiveRateResponse> {
    const buyRate =
      type === "sell" ? null : await this.fetchAndCalculateRate("BUY");
    const sellRate =
      type === "buy" ? null : await this.fetchAndCalculateRate("SELL");

    let averageRate: number | null = null;
    let spread: number | null = null;
    let spreadPercentage: number | null = null;

    if (buyRate !== null && sellRate !== null) {
      averageRate = (buyRate + sellRate) / 2;
      spread = buyRate - sellRate;
      spreadPercentage = (spread / sellRate) * 100;
    }

    return {
      buy_rate: buyRate,
      sell_rate: sellRate,
      average_rate: averageRate,
      spread,
      spread_percentage: spreadPercentage
        ? parseFloat(spreadPercentage.toFixed(2))
        : null,
      calculated_at: new Date().toISOString(),
      sample_size: {
        buy: buyRate !== null ? 10 : 0,
        sell: sellRate !== null ? 10 : 0,
      },
    };
  }

  private async fetchAndCalculateRate(
    tradeType: "BUY" | "SELL",
  ): Promise<number | null> {
    try {
      const offers = await this.fetchOffers(tradeType);

      if (offers.length === 0) {
        console.warn(`No ${tradeType} offers available`);
        return null;
      }

      const topOffers = offers.slice(0, 10);
      const prices = topOffers.map((offer) => parseFloat(offer.adv.price));
      const sum = prices.reduce((acc, price) => acc + price, 0);

      return sum / prices.length;
    } catch (error) {
      console.error(`Error fetching ${tradeType} offers:`, error);
      return null;
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

    // Filter for merchants only
    return response.data.data.filter(
      (offer) => offer.advertiser.userType === "merchant",
    );
  }
}

export default new BinanceLiveService();
