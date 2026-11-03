import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4321",
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
