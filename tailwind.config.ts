import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // VLADCASE dark gaming surfaces
        ink: {
          950: "#070810",
          900: "#090A0F",
          800: "#0C0E15",
          700: "#11131A",
          600: "#171A23",
          500: "#1E2230",
          400: "#272C3D",
        },
        surface: {
          DEFAULT: "#11131A",
          dark: "#0C0E15",
          light: "#171A23",
          raised: "#1E2230",
          hover: "#272C3D",
        },
        border: {
          subtle: "rgba(255,255,255,0.06)",
          default: "rgba(255,255,255,0.1)",
          strong: "rgba(255,255,255,0.16)",
        },
        text: {
          primary: "#F5F7FA",
          secondary: "#A2A9B6",
          muted: "#5B6475",
          dim: "#3F4654",
        },
        // Primary brand accent — electric violet
        brand: {
          DEFAULT: "#8B5CF6",
          50: "#F2EEFF",
          100: "#E0D5FF",
          200: "#C4ACFF",
          300: "#A283FF",
          400: "#8B5CF6",
          500: "#7C3AED",
          600: "#6D28D9",
          700: "#5B21B6",
          800: "#4C1D95",
          900: "#2E1065",
        },
        // Secondary accent — hot magenta
        magenta: {
          DEFAULT: "#EC4899",
          400: "#F472B6",
          500: "#EC4899",
          600: "#DB2777",
        },
        // Premium accent — warm gold
        gold: {
          DEFAULT: "#F5B642",
          light: "#FFD66B",
          dark: "#B8860B",
          glow: "rgba(245, 182, 66, 0.45)",
        },
        // Rarity — CS2 standard
        rarity: {
          consumer: "#B0C3D9",
          industrial: "#5E98D9",
          milspec: "#4B69FF",
          restricted: "#8847FF",
          classified: "#D32CE6",
          covert: "#EB4B4B",
          special: "#FFD700",
        },
        success: "#10B981",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        // Condensed display for gaming headings
        display: ["Rajdhani", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        'glow-brand': "0 0 28px rgba(139, 92, 246, 0.45)",
        'glow-magenta': "0 0 28px rgba(236, 72, 153, 0.4)",
        'glow-gold': "0 0 32px rgba(245, 182, 66, 0.55)",
        'glow-covert': "0 0 28px rgba(235, 75, 75, 0.45)",
        'glow-special': "0 0 32px rgba(255, 215, 0, 0.55)",
        'card': "0 10px 32px 0 rgba(0, 0, 0, 0.5)",
        'card-elevated': "0 18px 40px 0 rgba(0, 0, 0, 0.65)",
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'marquee': 'marquee 40s linear infinite',
        'marquee-rev': 'marqueeRev 40s linear infinite',
        'glow-pulse': 'glowPulse 2.4s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'ticker': 'ticker 60s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeRev: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', filter: 'blur(20px)' },
          '50%': { opacity: '1', filter: 'blur(28px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
