import type { Config } from "tailwindcss";
import uiConfig from "../../packages/ui/tailwind.config";

const config: Config = {
  presets: [uiConfig],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "var(--font-sans)", "system-ui", "sans-serif"]
      }
    }
  }
};

export default config;
