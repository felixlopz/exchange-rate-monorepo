import { RateData } from "../types";

export abstract class BaseProvider {
  public readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  // Each provider must implement this
  abstract fetchRates(): Promise<RateData[]>;

  // Helper to normalize rate data
  protected normalizeRate(
    currencyFrom: string,
    currencyTo: string,
    rate: number,
    updateType: string | null = null,
    metadata: Record<string, any> = {},
  ): RateData {
    return {
      provider: this.name,
      currency_from: currencyFrom,
      currency_to: currencyTo,
      rate: parseFloat(rate.toString()),
      update_type: updateType,
      date: new Date().toISOString().split("T")[0],
      metadata,
    };
  }
}
