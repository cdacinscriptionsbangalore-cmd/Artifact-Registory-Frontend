import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",

  use: {
    baseURL: "http://localhost:3000",
    headless: false, permissions: ["geolocation"],
    geolocation: {
      latitude: 12.9716,
      longitude: 77.5946,
    },
  },
});