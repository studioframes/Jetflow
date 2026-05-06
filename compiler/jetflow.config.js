// jetflow.config.js
export default {
  darkMode: "media",   // "media" | "class" | "both"
  reset: true,
  debug: false,
  mutationDebounce: 16,
  important: false,

  screens: {
    sm:  "640px",
    md:  "768px",
    lg:  "1024px",
    xl:  "1280px",
    "2xl": "1536px"
  },

  safelist: [],

  theme: {
    colors: {
      inherit:     "inherit",
      current:     "currentColor",
      transparent: "transparent",
      black:       "#000000",
      white:       "#ffffff",
      brand: {
        light: "#ffd9d9",
        mid:   "#c91414",
        dark:  "#830d0d",
        50:    "#ffeeee",
        100:   "#ffd9d9",
        500:   "#c91414",
        600:   "#a30f0f",
        700:   "#830d0d"
      },
      slate: {
        50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1",
        400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155",
        800: "#1e293b", 900: "#0f172a", 950: "#020617"
      },
      gray: {
        50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb", 300: "#d1d5db",
        400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151",
        800: "#1f2937", 900: "#111827", 950: "#030712"
      },
      red: {
        50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5",
        400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c",
        800: "#991b1b", 900: "#7f1d1d", 950: "#450a0a"
      },
      orange: {
        50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74",
        400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c",
        800: "#9a3412", 900: "#7c2d12", 950: "#431407"
      },
      amber: {
        50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
        400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309",
        800: "#92400e", 900: "#78350f", 950: "#451a03"
      },
      yellow: {
        50: "#fefce8", 100: "#fef9c3", 200: "#fef08a", 300: "#fde047",
        400: "#facc15", 500: "#eab308", 600: "#ca8a04", 700: "#a16207",
        800: "#854d0e", 900: "#713f12", 950: "#422006"
      },
      green: {
        50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac",
        400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d",
        800: "#166534", 900: "#14532d", 950: "#052e16"
      },
      emerald: {
        50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7",
        400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857",
        800: "#065f46", 900: "#064e3b", 950: "#022c22"
      },
      teal: {
        50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4",
        400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e",
        800: "#115e59", 900: "#134e4a", 950: "#042f2e"
      },
      cyan: {
        50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9",
        400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490",
        800: "#155e75", 900: "#164e63", 950: "#083344"
      },
      sky: {
        50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc",
        400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1",
        800: "#075985", 900: "#0c4a6e", 950: "#082f49"
      },
      blue: {
        50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd",
        400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8",
        800: "#1e40af", 900: "#1e3a8a", 950: "#172554"
      },
      indigo: {
        50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc",
        400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca",
        800: "#3730a3", 900: "#312e81", 950: "#1e1b4b"
      },
      violet: {
        50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd",
        400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9",
        800: "#5b21b6", 900: "#4c1d95", 950: "#2e1065"
      },
      purple: {
        50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe",
        400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce",
        800: "#6b21a8", 900: "#581c87", 950: "#3b0764"
      },
      pink: {
        50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 300: "#f9a8d4",
        400: "#f472b6", 500: "#ec4899", 600: "#db2777", 700: "#be185d",
        800: "#9d174d", 900: "#831843", 950: "#500724"
      },
      rose: {
        50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af",
        400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c",
        800: "#9f1239", 900: "#881337", 950: "#4c0519"
      }
    },

    spacing: {
      px: "1px", 0: "0px", 0.5: "0.125rem", 1: "0.25rem", 1.5: "0.375rem",
      2: "0.5rem", 2.5: "0.625rem", 3: "0.75rem", 3.5: "0.875rem",
      4: "1rem", 5: "1.25rem", 6: "1.5rem", 7: "1.75rem", 8: "2rem",
      9: "2.25rem", 10: "2.5rem", 11: "2.75rem", 12: "3rem", 14: "3.5rem",
      16: "4rem", 18: "4.5rem", 20: "5rem", 24: "6rem", 28: "7rem",
      32: "8rem", 36: "9rem", 40: "10rem", 44: "11rem", 48: "12rem",
      52: "13rem", 56: "14rem", 60: "15rem", 64: "16rem", 72: "18rem",
      80: "20rem", 96: "24rem", 128: "32rem"
    },

    fontSize: {
      xs:   ["0.75rem",  "1rem"],
      sm:   ["0.875rem", "1.25rem"],
      base: ["1rem",     "1.5rem"],
      lg:   ["1.125rem", "1.75rem"],
      xl:   ["1.25rem",  "1.75rem"],
      "2xl": ["1.5rem",  "2rem"],
      "3xl": ["1.875rem","2.25rem"],
      "4xl": ["2.25rem", "2.5rem"],
      "5xl": ["3rem",    "1"],
      "6xl": ["3.75rem", "1"],
      "7xl": ["4.5rem",  "1"],
      "8xl": ["6rem",    "1"],
      "9xl": ["8rem",    "1"]
    },

    fontWeight: {
      thin: "100", extralight: "200", light: "300", normal: "400",
      medium: "500", semibold: "600", bold: "700", extrabold: "800", black: "900"
    },

    lineHeight: {
      none: "1", tight: "1.25", snug: "1.375", normal: "1.5",
      relaxed: "1.625", loose: "2",
      3: ".75rem", 4: "1rem", 5: "1.25rem", 6: "1.5rem",
      7: "1.75rem", 8: "2rem", 9: "2.25rem", 10: "2.5rem"
    },

    letterSpacing: {
      tighter: "-0.05em", tight: "-0.025em", normal: "0em",
      wide: "0.025em", wider: "0.05em", widest: "0.1em"
    },

    borderRadius: {
      none: "0px", sm: "0.125rem", DEFAULT: "0.25rem", md: "0.375rem",
      lg: "0.5rem", xl: "0.75rem", "2xl": "1rem", "3xl": "1.5rem",
      "4xl": "2rem", full: "9999px"
    },

    borderWidth: {
      DEFAULT: "1px", 0: "0px", 2: "2px", 4: "4px", 8: "8px"
    },

    opacity: {
      0: "0", 5: "0.05", 10: "0.1", 20: "0.2", 25: "0.25",
      30: "0.3", 40: "0.4", 50: "0.5", 60: "0.6", 70: "0.7",
      75: "0.75", 80: "0.8", 90: "0.9", 95: "0.95", 100: "1"
    },

    boxShadow: {
      sm:      "0 1px 2px 0 rgb(0 0 0/0.05)",
      DEFAULT: "0 1px 3px 0 rgb(0 0 0/0.1),0 1px 2px -1px rgb(0 0 0/0.1)",
      md:      "0 4px 6px -1px rgb(0 0 0/0.1),0 2px 4px -2px rgb(0 0 0/0.1)",
      lg:      "0 10px 15px -3px rgb(0 0 0/0.1),0 4px 6px -4px rgb(0 0 0/0.1)",
      xl:      "0 20px 25px -5px rgb(0 0 0/0.1),0 8px 10px -6px rgb(0 0 0/0.1)",
      "2xl":   "0 25px 50px -12px rgb(0 0 0/0.25)",
      inner:   "inset 0 2px 4px 0 rgb(0 0 0/0.05)",
      none:    "0 0 #0000"
    },

    blur: {
      none: "0", sm: "4px", DEFAULT: "8px", md: "12px",
      lg: "16px", xl: "24px", "2xl": "40px", "3xl": "64px"
    },

    zIndex: {
      0: "0", 10: "10", 20: "20", 30: "30", 40: "40", 50: "50", auto: "auto"
    },

    transitionDuration: {
      75: "75ms", 100: "100ms", 150: "150ms", 200: "200ms",
      300: "300ms", 500: "500ms", 700: "700ms", 1000: "1000ms"
    },

    transitionTimingFunction: {
      DEFAULT:  "cubic-bezier(0.4,0,0.2,1)",
      linear:   "linear",
      in:       "cubic-bezier(0.4,0,1,1)",
      out:      "cubic-bezier(0,0,0.2,1)",
      "in-out": "cubic-bezier(0.4,0,0.2,1)"
    },

    animation: {
      none: "none",
      spin:   "jf-spin 1s linear infinite",
      ping:   "jf-ping 1s cubic-bezier(0,0,0.2,1) infinite",
      pulse:  "jf-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
      bounce: "jf-bounce 1s infinite"
    }
  },

  utilities: {
    "flex-center":   "flex items-center justify-center",
    "flex-between":  "flex items-center justify-between",
    "flex-around":   "flex items-center justify-around",
    "grid-center":   "grid place-items-center",
    "text-bold":     "font-bold",
    box: "block rounded-md border border-gray-200 bg-white p-4"
  },

  apply: {
    ".btn-primary":   "flex items-center gap-2 rounded-md bg-brand-mid px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-mid focus:ring-offset-2",
    ".btn-secondary": "flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white",
    ".card":          "block rounded-lg p-6 shadow-md border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900",
    ".notice":        "rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
  }
};