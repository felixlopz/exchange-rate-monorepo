export interface RateData {
  provider: string;
  currency_from: string;
  currency_to: string;
  rate: number;
  update_type: string | null;
  date: string;
  metadata?: Record<string, any>;
}

export interface ExchangeRate extends RateData {
  id: number;
  scraped_at: Date;
}

export interface ScraperResult {
  provider: string;
  success: boolean;
  rates?: RateData[];
  error?: string;
}

export interface ProviderConfig {
  name: string;
  enabled: boolean;
  url?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
  message?: string;
}

export interface BinanceOffer {
  adv: {
    price: string;
    surplusAmount: string;
  };
  advertiser: {
    nickName: string;
    monthFinishRate: number;
    userType: string;
  };
}

export interface BinanceResponse {
  code: string;
  data: BinanceOffer[];
  total: number;
  success: boolean;
}

export interface LiveRateResponse {
  buy_rate: number | null;
  sell_rate: number | null;
  average_rate: number | null;
  spread: number | null;
  spread_percentage: number | null;
  calculated_at: string;
  sample_size: {
    buy: number;
    sell: number;
  };
}
