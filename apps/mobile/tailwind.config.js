/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        success: "#10B981",
        danger: "#EF4444",
        background: "#F2F2F7",
        surface: "#FFFFFF",
        surfaceAlt: "#F2F2F7",
        textPrimary: "#1C1C1E",
        textSecondary: "#6B7280",
        positive: "#10B981",
      },
    },
  },
  plugins: [],
};
