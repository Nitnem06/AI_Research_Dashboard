/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      colors: {
        ink: {
          50: "#f8f7f4",
          100: "#eeebe4",
          200: "#dcd7cc",
          300: "#c5bfb0",
          400: "#a89e8c",
          500: "#8a7f6c",
          600: "#6d6354",
          700: "#534b3e",
          800: "#38342c",
          900: "#1e1c17",
          950: "#0f0e0b",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
        },
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        panel: "0 0 0 1px rgb(0 0 0 / 0.06), 0 2px 8px 0 rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};