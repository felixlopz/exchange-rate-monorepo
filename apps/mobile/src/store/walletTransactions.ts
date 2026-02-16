import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletTransaction } from '../types';
import { getUserId } from '../utils/userId';
import { useWalletsStore } from './wallets';
import * as Crypto from 'expo-crypto';

interface WalletTransactionsState {
  transactions: WalletTransaction[];

  // Actions
  addTransaction: (tx: Omit<WalletTransaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<WalletTransaction>) => void;
  deleteTransaction: (id: string) => void;

  // Selectors
  getTransactionsByWallet: (walletId: string) => WalletTransaction[];
  getTransactionsByMonth: (walletId: string, year: number, month: number) => WalletTransaction[];
  getMonthlyStats: (walletId: string, year: number, month: number) => {
    income: number;
    expense: number;
    balance: number;
  };
}

export const useWalletTransactionsStore = create<WalletTransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: async (txData) => {
        const userId = await getUserId();

        const newTransaction: WalletTransaction = {
          ...txData,
          id: Crypto.randomUUID(),
          user_id: userId,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));

        // Update wallet balance
        useWalletsStore.getState().updateBalance(
          txData.wallet_id,
          txData.amount,
          txData.type
        );
      },

      updateTransaction: (id, updates) => {
        const oldTx = get().transactions.find((tx) => tx.id === id);
        if (!oldTx) return;

        // If amount or type changed, recalculate wallet balance
        if (updates.amount !== undefined || updates.type !== undefined) {
          // Reverse old transaction
          useWalletsStore.getState().updateBalance(
            oldTx.wallet_id,
            oldTx.amount,
            oldTx.type === 'income' ? 'expense' : 'income'
          );

          // Apply new transaction
          useWalletsStore.getState().updateBalance(
            oldTx.wallet_id,
            updates.amount ?? oldTx.amount,
            updates.type ?? oldTx.type
          );
        }

        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        }));
      },

      deleteTransaction: (id) => {
        const tx = get().transactions.find((t) => t.id === id);
        if (!tx) return;

        // Reverse the transaction's effect on wallet balance
        useWalletsStore.getState().updateBalance(
          tx.wallet_id,
          tx.amount,
          tx.type === 'income' ? 'expense' : 'income'
        );

        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getTransactionsByWallet: (walletId) =>
        get()
          .transactions.filter((tx) => tx.wallet_id === walletId)
          .sort((a, b) =>
            new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
          ),

      getTransactionsByMonth: (walletId, year, month) => {
        return get().transactions.filter((tx) => {
          if (tx.wallet_id !== walletId) return false;
          const date = new Date(tx.transaction_date);
          return date.getFullYear() === year && date.getMonth() === month;
        });
      },

      getMonthlyStats: (walletId, year, month) => {
        const transactions = get().getTransactionsByMonth(walletId, year, month);
        return transactions.reduce(
          (stats, tx) => {
            if (tx.type === 'income') {
              stats.income += tx.amount;
            } else {
              stats.expense += tx.amount;
            }
            stats.balance = stats.income - stats.expense;
            return stats;
          },
          { income: 0, expense: 0, balance: 0 }
        );
      },
    }),
    {
      name: 'wallet-transactions-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
