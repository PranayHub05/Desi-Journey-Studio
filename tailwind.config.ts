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
        forest: {
          900: "#0D251F",
          800: "#173F35", // Primary Brand Green
          700: "#1E5245",
          600: "#267A62", // Secondary Emerald
          500: "#32977B",
          100: "#E3EFEA",
          50: "#F0F7F4",
        },
        stone: {
          canvas: "#F7F5EE", // Canvas Neutral Warm Alpine Stone
          border: "#E0E5E0",
          surface: "#FFFFFF",
          muted: "#717971",
        },
        gold: {
          600: "#B88A32",
          500: "#D4A64B", // Premium Accent Gold
          400: "#E2BF6F",
          100: "#FBF5E6",
          50: "#FDFBF5",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(23, 63, 53, 0.06), 0 1px 2px 0 rgba(23, 63, 53, 0.04)",
        elevated: "0 10px 25px -5px rgba(23, 63, 53, 0.08), 0 8px 10px -6px rgba(23, 63, 53, 0.04)",
        dropdown: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
