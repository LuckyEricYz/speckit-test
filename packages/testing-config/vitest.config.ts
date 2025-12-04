import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: [path.resolve(__dirname, "setup.ts")],
    include: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"]
  }
});
