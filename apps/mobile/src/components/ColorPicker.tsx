import { View, TouchableOpacity } from "react-native";
import { CATEGORY_COLOR_ARRAY, COLORS } from "../constants";

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-3 justify-center py-4">
      {CATEGORY_COLOR_ARRAY.map((color) => {
        const isSelected = color === selectedColor;
        return (
          <TouchableOpacity
            key={color}
            onPress={() => onColorSelect(color)}
            style={{
              width: 48,
              height: 48,
              backgroundColor: color,
              borderRadius: 24,
              borderWidth: isSelected ? 3 : 0,
              borderColor: COLORS.primary,
            }}
          />
        );
      })}
    </View>
  );
}
