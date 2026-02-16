export const COLORS = {
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  background: "#F2F2F7",
  surface: "#FFFFFF",
  surfaceAlt: "#F2F2F7",
  textPrimary: "#1C1C1E",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  border: "#E5E7EB",
};

export const CATEGORY_COLORS = {
  red: "#EF4444",
  orange: "#F97316",
  amber: "#F59E0B",
  green: "#10B981",
  teal: "#14B8A6",
  blue: "#3B82F6",
  indigo: "#6366F1",
  purple: "#8B5CF6",
  pink: "#EC4899",
  gray: "#6B7280",
  brown: "#92400E",
  yellow: "#EAB308",
};

export const CATEGORY_COLOR_ARRAY = Object.values(CATEGORY_COLORS);

export function useColors() {
  return COLORS;
}

export const CURRENCIES = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  USDT: { symbol: "₮", name: "Tether" },
  VES: { symbol: "Bs", name: "Bolívar" },
};
