import { ExchangeRate, BinanceLiveRate, ApiResponse } from "../types";

// Update this with your actual API URL
const API_URL = "http://localhost:3000/api";

export const api = {
  // Get latest BCV rates
  async getLatestBCVRates(): Promise<ExchangeRate[]> {
    const response = await fetch(`${API_URL}/rates/latest?provider=BCV`);
    const data: ApiResponse<ExchangeRate[]> = await response.json();
    if (!data.success)
      throw new Error(data.error || "Failed to fetch BCV rates");
    return data.data || [];
  },

  // Get latest Binance stored rates
  async getLatestBinanceRates(): Promise<ExchangeRate[]> {
    const response = await fetch(`${API_URL}/binance/latest`);
    const data: ApiResponse<ExchangeRate[]> = await response.json();
    if (!data.success)
      throw new Error(data.error || "Failed to fetch Binance rates");
    return data.data || [];
  },

  // Get live Binance rates
  async getLiveBinanceRates(): Promise<BinanceLiveRate> {
    const response = await fetch(`${API_URL}/binance/live`);
    const data: ApiResponse<BinanceLiveRate> = await response.json();
    if (!data.success)
      throw new Error(data.error || "Failed to fetch live rates");
    return data.data!;
  },

  // Get historical rates
  async getHistoricalRates(
    currency: string,
    startDate: string,
    endDate: string,
    provider?: string,
  ): Promise<ExchangeRate[]> {
    const params = new URLSearchParams({
      currency,
      startDate,
      endDate,
      ...(provider && { provider }),
    });
    const response = await fetch(`${API_URL}/rates/history?${params}`);
    const data: ApiResponse<ExchangeRate[]> = await response.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch history");
    return data.data || [];
  },

  // Get Binance history
  async getBinanceHistory(
    type?: "buy" | "sell",
    startDate?: string,
    endDate?: string,
  ): Promise<ExchangeRate[]> {
    const params = new URLSearchParams({
      ...(type && { type }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    const response = await fetch(`${API_URL}/binance/history?${params}`);
    const data: ApiResponse<ExchangeRate[]> = await response.json();
    if (!data.success)
      throw new Error(data.error || "Failed to fetch Binance history");
    return data.data || [];
  },
};
