export default {
  darkMode: "both",
  reset: true,
  screens: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px"
  },
  containers: {
    sm: "24rem",
    md: "28rem",
    lg: "32rem",
    xl: "36rem"
  },
  safelist: [
    "hidden",
    "md:flex",
    "hover:bg-brand-dark",
    "focus:ring-2"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#d9efff",
          mid: "#1479c9",
          dark: "#0d4f83",
          50: "#eef8ff",
          100: "#d9efff",
          500: "#1479c9",
          600: "#0f62a3",
          700: "#0d4f83"
        },
        blue: {
          light: "#93c5fd",
          mid: "#3b82f6",
          dark: "#1d4ed8"
        }
      },
      spacing: {
        18: "4.5rem",
        128: "32rem"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  apply: {
    ".btn-primary": "flex-center gap-2 rounded-md bg-brand-mid px-4 py-2 text-sm text-bold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid focus:ring-offset-2",
    ".btn-secondary": "flex-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-bold text-slate-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-mid dark:border-slate-600 dark:bg-slate-900 dark:text-white",
    ".card": "box rounded-lg p-6 shadow-md dark:border-slate-700 dark:bg-slate-900",
    ".notice": "rounded-md border border-amber-200 bg-amber-50 p-[8px_16px] text-sm text-amber-900"
  },
  utilities: {
    "flex-center": "flex items-center justify-center",
    "flex-between": "flex items-center justify-between",
    "text-bold": "font-bold",
    box: "block rounded-md border border-gray-200 bg-white p-4",
    "text-balance": {
      "text-wrap": "balance"
    }
  }
};
