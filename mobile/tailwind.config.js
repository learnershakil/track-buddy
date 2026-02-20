/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        surface:    "#111117",
        card:       "#1A1A24",
        border:     "#2A2A35",
        primary:    "#7C3AED",
        "primary-dark": "#6D28D9",
        accent:     "#F59E0B",
        danger:     "#EF4444",
        success:    "#10B981",
        muted:      "#94A3B8",
      },
      fontFamily: {
        sans:  ["Inter-Regular"],
        bold:  ["Inter-Bold"],
        semi:  ["Inter-SemiBold"],
      },
    },
  },
  plugins: [],
};
