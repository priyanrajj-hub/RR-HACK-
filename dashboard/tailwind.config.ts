import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        rr: {
          pink: "#EA1A85",
          "pink-light": "#FF4B9E",
          "pink-dark": "#C20D69",
          blue: "#254AA5",
          "blue-light": "#3B82F6",
          navy: "#0A1128",
          dark: "#060A18",
          card: "#0F1836",
          "card-hover": "#172554",
          border: "#1E2C5A",
          gold: "#F5A623",
          cyan: "#00D2FF"
        }
      },
    },
  },
  plugins: [],
};
export default config;
