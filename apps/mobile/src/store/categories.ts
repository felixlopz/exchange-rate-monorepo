import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Category, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../types";
import { CATEGORY_COLORS } from "../constants";

interface CategoriesState {
  categories: Category[];
  addCategory: (category: Omit<Category, "id" | "createdAt">) => void;
  updateCategory: (id: string, updates: { name?: string; color?: string }) => void;
  removeCategory: (id: string) => void;
  getCategoriesByType: (type: TransactionType) => Category[];
  getCategoryById: (id: string) => Category | undefined;
}

// Default category seeds
const createDefaultCategories = (): Category[] => {
  const now = new Date().toISOString();
  const defaults: Array<{ name: string; color: string; type: TransactionType }> = [
    // Expense categories
    { name: "Comestibles", color: CATEGORY_COLORS.orange, type: "expense" },
    { name: "Servicios", color: CATEGORY_COLORS.blue, type: "expense" },
    { name: "Salidas", color: CATEGORY_COLORS.pink, type: "expense" },
    { name: "Entretenimiento", color: CATEGORY_COLORS.purple, type: "expense" },
    { name: "Salud", color: CATEGORY_COLORS.green, type: "expense" },
    { name: "Reparaciones", color: CATEGORY_COLORS.brown, type: "expense" },
    // Income categories
    { name: "Freelance", color: CATEGORY_COLORS.green, type: "income" },
    { name: "Bonus", color: CATEGORY_COLORS.yellow, type: "income" },
    { name: "Salario", color: CATEGORY_COLORS.blue, type: "income" },
  ];

  return defaults.map((cat, index) => ({
    id: `default-${index}-${Date.now()}`,
    name: cat.name,
    color: cat.color,
    type: cat.type,
    isDefault: true,
    createdAt: now,
  }));
};

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      categories: [],

      addCategory: (category) => {
        const state = get();

        // Validate uniqueness (case-insensitive)
        const exists = state.categories.some(
          (cat) =>
            cat.type === category.type &&
            cat.name.toLowerCase() === category.name.trim().toLowerCase()
        );

        if (exists) {
          throw new Error("Ya existe una categoría con este nombre");
        }

        if (!category.name.trim()) {
          throw new Error("El nombre de la categoría no puede estar vacío");
        }

        const newCategory: Category = {
          ...category,
          name: category.name.trim(),
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, updates) => {
        const state = get();
        const category = state.categories.find((cat) => cat.id === id);

        if (!category) {
          throw new Error("Categoría no encontrada");
        }

        if (category.isDefault && updates.name) {
          throw new Error("No se puede cambiar el nombre de las categorías predeterminadas");
        }

        // Validate name uniqueness if changing name
        if (updates.name) {
          const trimmedName = updates.name.trim();
          if (!trimmedName) {
            throw new Error("El nombre de la categoría no puede estar vacío");
          }

          const exists = state.categories.some(
            (cat) =>
              cat.id !== id &&
              cat.type === category.type &&
              cat.name.toLowerCase() === trimmedName.toLowerCase()
          );

          if (exists) {
            throw new Error("Ya existe una categoría con este nombre");
          }
        }

        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id
              ? {
                  ...cat,
                  ...(updates.name && { name: updates.name.trim() }),
                  ...(updates.color && { color: updates.color }),
                }
              : cat
          ),
        }));
      },

      removeCategory: (id) => {
        const state = get();
        const category = state.categories.find((cat) => cat.id === id);

        if (!category) {
          throw new Error("Categoría no encontrada");
        }

        // Check minimum categories per type
        const typeCategories = state.categories.filter((cat) => cat.type === category.type);
        if (typeCategories.length <= 1) {
          throw new Error("Debe haber al menos una categoría de este tipo");
        }

        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        }));
      },

      getCategoriesByType: (type) => {
        return get().categories.filter((cat) => cat.type === type);
      },

      getCategoryById: (id) => {
        return get().categories.find((cat) => cat.id === id);
      },
    }),
    {
      name: "categories-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Auto-seed default categories on first load
        if (state && state.categories.length === 0) {
          state.categories = createDefaultCategories();
        }
      },
    }
  )
);
