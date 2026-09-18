import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080A0D",
        surface: {
          DEFAULT: "#11151C",
          dark: "#0C0F14",
          light: "#161D27",
          hover: "#1E2633",
        },
        text: {
          primary: "#F5F7FA",
          secondary: "#8E96A3",
          muted: "#5B6475",
        },
        rarity: {
          consumer: "#B0C3D9",
          industrial: "#5E98D9",
          milspec: "#4B69FF",
          restricted: "#8847FF",
          classified: "#D32CE6",
          covert: "#EB4B4B",
          special: "#FFD700",
        },
        accent: {
          DEFAULT: "#22D3EE",
          hover: "#06B6D4",
          glow: "rgba(34, 211, 238, 0.4)",
        },
        gold: {
          DEFAULT: "#F59E0B",
          glow: "rgba(245, 158, 11, 0.4)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        'glow-accent': "0 0 25px rgba(34, 211, 238, 0.35)",
        'glow-gold': "0 0 30px rgba(245, 158, 11, 0.4)",
        'glow-covert': "0 0 25px rgba(235, 75, 75, 0.35)",
        'card': "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
