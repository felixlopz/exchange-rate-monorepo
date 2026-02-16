export interface ExchangeRate {
  id: number;
  provider: string;
  currency_from: string;
  currency_to: string;
  rate: string;
  update_type: string | null;
  scraped_at: string;
  date: string;
  metadata?: Record<string, any>;
}

export interface BinanceLiveRate {
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
}

export type TransactionType = "income" | "expense";

export const EXPENSE_CATEGORIES = [
  "Comestibles",
  "Servicios",
  "Salidas",
  "Entretenimiento",
  "Salud",
  "Reparaciones",
] as const;

export const INCOME_CATEGORIES = ["Freelance", "Bonus", "Salario"] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export interface Category {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  name: string;
  amount: number;
  currency: "USD" | "VES";
  categoryId: string;
  date: string;
  // Legacy field for backward compatibility
  category?: ExpenseCategory | IncomeCategory;
}
