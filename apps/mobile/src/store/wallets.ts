import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Wallet, WalletTransaction } from "../types";
import { getUserId } from "../utils/userId";
import * as Crypto from "expo-crypto";

interface WalletsState {
  wallets: Wallet[];

  // Actions
  addWallet: (
    wallet: Omit<
      Wallet,
      "id" | "user_id" | "current_balance" | "created_at" | "updated_at"
    >,
  ) => Promise<void>;
  updateWallet: (id: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  updateBalance: (
    walletId: string,
    amount: number,
    type: "income" | "expense",
  ) => void;
  recalculateBalance: (
    walletId: string,
    transactions: WalletTransaction[],
  ) => void;

  // Selectors
  getWalletById: (id: string) => Wallet | undefined;
  getActiveWallets: () => Wallet[];
  getWalletsByCurrency: (currency: string) => Wallet[];
  getTotalBalance: () => { usd: number; ves: number; eur: number };
}

export const useWalletsStore = create<WalletsState>()(
  persist(
    (set, get) => ({
      wallets: [],

      addWallet: async (walletData) => {
        const userId = await getUserId();
        const now = new Date().toISOString();

        const newWallet: Wallet = {
          ...walletData,
          id: Crypto.randomUUID(),
          user_id: userId,
          current_balance: walletData.initial_balance,
          is_active: true,
          created_at: now,
          updated_at: now,
        };

        set((state) => ({ wallets: [...state.wallets, newWallet] }));
      },

      updateWallet: (id, updates) => {
        set((state) => ({
          wallets: state.wallets.map((w) =>
            w.id === id
              ? { ...w, ...updates, updated_at: new Date().toISOString() }
              : w,
          ),
        }));
      },

      deleteWallet: (id) => {
        set((state) => ({
          wallets: state.wallets.map((w) =>
            w.id === id
              ? { ...w, is_active: false, updated_at: new Date().toISOString() }
              : w,
          ),
        }));
      },

      updateBalance: (walletId, amount, type) => {
        set((state) => ({
          wallets: state.wallets.map((w) => {
            if (w.id === walletId) {
              const delta = type === "income" ? amount : -amount;
              return {
                ...w,
                current_balance: w.current_balance + delta,
                updated_at: new Date().toISOString(),
              };
            }
            return w;
          }),
        }));
      },

      recalculateBalance: (walletId, transactions) => {
        const wallet = get().wallets.find((w) => w.id === walletId);
        if (!wallet) return;

        const balance = transactions.reduce((sum, tx) => {
          const delta = tx.type === "income" ? tx.amount : -tx.amount;
          return sum + delta;
        }, wallet.initial_balance);

        get().updateWallet(walletId, { current_balance: balance });
      },

      getWalletById: (id) => get().wallets.find((w) => w.id === id),

      getActiveWallets: () => get().wallets.filter((w) => w.is_active),

      getWalletsByCurrency: (currency) =>
        get().wallets.filter((w) => w.is_active && w.currency === currency),

      getTotalBalance: () => {
        const wallets = get().getActiveWallets();
        return wallets.reduce(
          (totals, wallet) => {
            const key = wallet.currency.toLowerCase() as "usd" | "ves" | "eur";
            totals[key] += wallet.current_balance;
            return totals;
          },
          { usd: 0, ves: 0, eur: 0 },
        );
      },
    }),
    {
      name: "wallets-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
