module {
  theme: {
    extend: {
      colors: {
        background: "#080A0D",
        surface: {
          DEFAULT: "#11151C",
          dark: "#0C0F14",
          light: "#151A22",
        },
        text: {
          primary: "#F5F7FA",
          secondary: "#8E96A3",
        },
        rarity: {
          consumer: "#A1A1AA",
          industrial: "#3B82F6",
          mil_spec: "#2563EB",
          restricted: "#A855F7",
          classified: "#EC4899",
          covert: "#EF4444",
          special: "#F59E0B",
        },
        accent: "#22D3EE",
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "Space Grotesk", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      backgroundImage: {
        'glass-gradient': "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)",
        'metallic-gradient': "linear-gradient(180deg, #1A202C 0%, #11151C 100%)",
      },
    },
  },
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
} satisfies typeof import("tailwindcss").Config
