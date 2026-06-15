import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      // ... rest of your aliases
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});