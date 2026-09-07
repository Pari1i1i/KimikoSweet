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
        background: "#FFF9FB",
        foreground: "#1A1A1A",
        brand: {
          bg: "#FFF9FB",
          pink: "#FFD3E6",
          accent: "#FF5C9A",
          butter: "#FFE066",
          dark: "#1A1A1A",
          cream: "#FFF1DE",
          mint: "#C1F4C5",
          lavender: "#E8D5FF",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Fredoka", "sans-serif"],
        body: ["var(--font-body)", "Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        neo: "4px 4px 0px #1A1A1A",
        "neo-sm": "2px 2px 0px #1A1A1A",
        "neo-lg": "6px 6px 0px #1A1A1A",
        "neo-xl": "8px 8px 0px #1A1A1A",
        "neo-active": "0px 0px 0px #1A1A1A",
      },
      borderRadius: {
        neo: "16px",
        "neo-sm": "12px",
        "neo-lg": "20px",
        "neo-pill": "9999px",
      },
      borderWidth: {
        neo: "3px",
        "neo-thick": "4px",
      },
    },
  },
  plugins: [],
};
export default config;
