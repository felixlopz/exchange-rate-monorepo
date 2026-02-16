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

// Account/Wallet Types
export type AccountType =
  | 'efectivo'    // Cash
  | 'banco'       // Bank
  | 'crédito'     // Credit
  | 'débito'      // Debit
  | 'ahorros'     // Savings
  | 'inversión'   // Investment
  | 'otro';       // Other

export interface Wallet {
  id: string;                    // UUID
  user_id: string;               // Device user ID
  name: string;                  // "My Savings", "Main Bank", etc.
  account_type: AccountType;
  currency: 'USD' | 'EUR' | 'VES';
  initial_balance: number;
  current_balance: number;       // Calculated from transactions
  is_active: boolean;
  created_at: string;            // ISO date
  updated_at: string;
  metadata?: {
    color?: string;              // For visual distinction
    icon?: string;               // Account icon name
    notes?: string;
  };
}

export interface WalletTransaction {
  id: string;                    // UUID
  wallet_id: string;             // Links to Wallet.id
  user_id: string;
  type: TransactionType;         // 'income' | 'expense'
  amount: number;
  currency: 'USD' | 'EUR' | 'VES';  // Same as wallet currency
  category_id?: string;          // Optional, links to existing categories
  name: string;                  // Transaction description
  notes?: string;
  transaction_date: string;      // ISO date
  created_at: string;
  metadata?: {
    converted_amount?: number;   // Conversion to USD or VES
    converted_currency?: string;
    exchange_rate?: number;      // Rate used for conversion
  };
}
