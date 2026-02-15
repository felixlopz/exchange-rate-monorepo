import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "../types";

interface TransactionsState {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => void;
  removeTransaction: (id: string) => void;
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [
            {
              ...tx,
              id: Date.now().toString(36) + Math.random().toString(36).slice(2),
              date: new Date().toISOString(),
            },
            ...state.transactions,
          ],
        })),
      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "transactions-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
