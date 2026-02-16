import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCategoriesStore } from "../store/categories";
import { useTransactionsStore } from "../store/transactions";
import CategoryListItem from "../components/CategoryListItem";
import CategoryModal from "../components/CategoryModal";
import { TransactionType } from "../types";
import { CATEGORY_COLORS, COLORS } from "../constants";

export default function SettingsScreen() {
  const { categories, addCategory, updateCategory, removeCategory } = useCategoriesStore();
  const { transactions } = useTransactionsStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalType, setModalType] = useState<TransactionType>("expense");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState<string>(CATEGORY_COLORS.gray);

  const expenseCategories = categories.filter((cat) => cat.type === "expense");
  const incomeCategories = categories.filter((cat) => cat.type === "income");

  const handleAddCategory = (type: TransactionType) => {
    setModalMode("add");
    setModalType(type);
    setEditingCategoryId(null);
    setEditingName("");
    setEditingColor(CATEGORY_COLORS.gray);
    setModalVisible(true);
  };

  const handleEditCategory = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return;

    setModalMode("edit");
    setModalType(category.type);
    setEditingCategoryId(categoryId);
    setEditingName(category.name);
    setEditingColor(category.color);
    setModalVisible(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return;

    // Check if category is used in transactions
    const usageCount = transactions.filter((tx) => tx.categoryId === categoryId).length;
    if (usageCount > 0) {
      Alert.alert(
        "Error",
        `Esta categoría está en uso en ${usageCount} transacciones. No se puede eliminar.`
      );
      return;
    }

    Alert.alert(
      "Eliminar Categoría",
      `¿Estás seguro de eliminar "${category.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            try {
              removeCategory(categoryId);
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Error al eliminar"
              );
            }
          },
        },
      ]
    );
  };

  const handleSave = (name: string, color: string) => {
    try {
      if (modalMode === "add") {
        addCategory({
          name,
          color,
          type: modalType,
          isDefault: false,
        });
      } else if (editingCategoryId) {
        updateCategory(editingCategoryId, { name, color });
      }
      setModalVisible(false);
    } catch (error) {
      throw error; // Re-throw to be handled by CategoryModal
    }
  };

  const canDeleteCategory = (categoryId: string): boolean => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return false;

    const usageCount = transactions.filter((tx) => tx.categoryId === categoryId).length;
    return usageCount === 0;
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Header */}
        <Text className="text-textPrimary text-2xl font-bold mb-6">Configuración</Text>

        {/* Expense Categories Section */}
        <View className="mb-6">
          <Text className="text-textPrimary text-lg font-semibold mb-3">Categorías de Gastos</Text>
          {expenseCategories.map((category) => (
            <CategoryListItem
              key={category.id}
              category={category}
              onEdit={() => handleEditCategory(category.id)}
              onDelete={() => handleDeleteCategory(category.id)}
              canDelete={canDeleteCategory(category.id)}
            />
          ))}
          <TouchableOpacity
            className="bg-primary py-3 rounded-xl items-center mt-2"
            onPress={() => handleAddCategory("expense")}
          >
            <Text className="text-white text-base font-semibold">Agregar Categoría</Text>
          </TouchableOpacity>
        </View>

        {/* Income Categories Section */}
        <View className="mb-6">
          <Text className="text-textPrimary text-lg font-semibold mb-3">
            Categorías de Ingresos
          </Text>
          {incomeCategories.map((category) => (
            <CategoryListItem
              key={category.id}
              category={category}
              onEdit={() => handleEditCategory(category.id)}
              onDelete={() => handleDeleteCategory(category.id)}
              canDelete={canDeleteCategory(category.id)}
            />
          ))}
          <TouchableOpacity
            className="bg-success py-3 rounded-xl items-center mt-2"
            onPress={() => handleAddCategory("income")}
          >
            <Text className="text-white text-base font-semibold">Agregar Categoría</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Modal */}
      <CategoryModal
        visible={modalVisible}
        mode={modalMode}
        type={modalType}
        initialName={editingName}
        initialColor={editingColor}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
