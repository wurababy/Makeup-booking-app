import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: "#E8A7B5", baby: "#F7DDE3", ivory: "#FFF9F5", rose: "#A9566D",
        champagne: "#E8D5C4", brown: "#49383A", mauve: "#9C858A", muted: "#7E676C",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
