import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "../types";
import { useCategoriesStore } from "./categories";
import { CATEGORY_COLORS } from "../constants";

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
      onRehydrateStorage: () => (state) => {
        // Migration: Convert old category strings to categoryId
        if (state && state.transactions.length > 0) {
          const categoriesStore = useCategoriesStore.getState();
          let needsMigration = false;

          const migratedTransactions = state.transactions.map((tx: any) => {
            // Check if this is an old transaction with category string
            if (tx.category && typeof tx.category === "string" && !tx.categoryId) {
              needsMigration = true;

              // Find matching category by name
              let category = categoriesStore.categories.find(
                (cat) =>
                  cat.type === tx.type &&
                  cat.name.toLowerCase() === tx.category.toLowerCase()
              );

              // If no match found, create a new custom category
              if (!category) {
                try {
                  categoriesStore.addCategory({
                    name: tx.category,
                    color: CATEGORY_COLORS.gray,
                    type: tx.type,
                    isDefault: false,
                  });
                  // Get the newly created category
                  category = categoriesStore.categories.find(
                    (cat) =>
                      cat.type === tx.type &&
                      cat.name.toLowerCase() === tx.category.toLowerCase()
                  );
                } catch (error) {
                  console.error("Failed to create category during migration:", error);
                }
              }

              // Return migrated transaction
              return {
                ...tx,
                categoryId: category?.id || "",
                // Keep old category field for backward compatibility (will be removed later)
                category: undefined,
              };
            }

            return tx;
          });

          if (needsMigration) {
            state.transactions = migratedTransactions;
          }
        }
      },
    }
  )
);
