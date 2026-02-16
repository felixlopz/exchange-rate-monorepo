import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from "react-native";
import { TransactionType } from "../types";
import ColorPicker from "./ColorPicker";
import { CATEGORY_COLORS, COLORS } from "../constants";

interface CategoryModalProps {
  visible: boolean;
  mode: "add" | "edit";
  type: TransactionType;
  initialName?: string;
  initialColor?: string;
  onSave: (name: string, color: string) => void;
  onClose: () => void;
}

export default function CategoryModal({
  visible,
  mode,
  type,
  initialName = "",
  initialColor = CATEGORY_COLORS.gray,
  onSave,
  onClose,
}: CategoryModalProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  // Reset fields when modal opens
  useEffect(() => {
    if (visible) {
      setName(initialName);
      setColor(initialColor);
    }
  }, [visible, initialName, initialColor]);

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Error", "El nombre de la categoría no puede estar vacío");
      return;
    }

    try {
      onSave(trimmedName, color);
      onClose();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Error al guardar");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <View className="bg-surface rounded-2xl p-6 mx-5 w-full max-w-md shadow-md shadow-black/8">
          {/* Title */}
          <Text className="text-textPrimary text-xl font-bold mb-4">
            {mode === "add" ? "Nueva Categoría" : "Editar Categoría"}
          </Text>

          {/* Name input */}
          <TextInput
            className="bg-surfaceAlt rounded-xl px-4 py-3 text-textPrimary text-base mb-4"
            value={name}
            onChangeText={setName}
            placeholder="Nombre de la categoría"
            placeholderTextColor={COLORS.textTertiary}
            autoFocus
          />

          {/* Color picker */}
          <ColorPicker selectedColor={color} onColorSelect={setColor} />

          {/* Action buttons */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl items-center"
              onPress={onClose}
            >
              <Text className="text-textSecondary text-base font-semibold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl items-center bg-primary"
              onPress={handleSave}
            >
              <Text className="text-white text-base font-semibold">Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
