import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{tsx,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#93c5fd",
          DEFAULT: "#2563eb",
          dark: "#1d4ed8"
        }
      },
      borderRadius: {
        pill: "9999px"
      }
    }
  },
  plugins: []
};

export default config;
