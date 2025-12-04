import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "@repo/testing/vitest";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["src/**/*.test.{ts,tsx}"]
    }
  })
);
