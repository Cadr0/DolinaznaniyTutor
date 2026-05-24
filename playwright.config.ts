import { defineConfig, devices } from "@playwright/test";
import path from "path";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const authDir = path.join(__dirname, "e2e/.auth");

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 1,
  workers: 1,
  timeout: 45_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "auth",
      testMatch: /auth\.spec\.ts/,
    },
    {
      name: "tutor",
      testMatch: [/homework-tutor\.spec\.ts/, /student-card\.spec\.ts/],
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(authDir, "tutor.json"),
      },
    },
    {
      name: "student",
      testMatch: /homework-student\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(authDir, "student.json"),
      },
    },
  ],
});
