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
        dark: {
          100: "#374151",
          200: "#1F2937",
          300: "#111827",
        },
      },
    },
  },
  plugins: [],
};
