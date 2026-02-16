import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../types";
import { COLORS } from "../constants";

interface CategoryListItemProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export default function CategoryListItem({
  category,
  onEdit,
  onDelete,
  canDelete,
}: CategoryListItemProps) {
  const isDeleteDisabled = !canDelete;

  return (
    <View className="flex-row items-center bg-surface rounded-2xl px-4 py-3 mb-2 shadow-sm shadow-black/5">
      {/* Color dot */}
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: category.color,
          marginRight: 12,
        }}
      />

      {/* Category name */}
      <Text className="flex-1 text-textPrimary text-base font-medium">{category.name}</Text>

      {/* Edit button */}
      <TouchableOpacity onPress={onEdit} hitSlop={8} className="mr-3">
        <Ionicons name="pencil-outline" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {/* Delete button */}
      <TouchableOpacity
        onPress={onDelete}
        hitSlop={8}
        disabled={isDeleteDisabled}
        style={{ opacity: isDeleteDisabled ? 0.3 : 1 }}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}
