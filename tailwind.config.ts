import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: "#F48FB1", baby: "#FDE3EC", ivory: "#FFF8FA", rose: "#B8386A",
        champagne: "#F2D6C9", brown: "#49383A", mauve: "#9C858A", muted: "#7A6166",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
