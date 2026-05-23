import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const tutorEmail = process.env.E2E_TUTOR_EMAIL;
const tutorPassword = process.env.E2E_TUTOR_PASSWORD;
const studentEmail = process.env.E2E_STUDENT_EMAIL;
const studentPassword = process.env.E2E_STUDENT_PASSWORD;

test.describe("baseline smoke", () => {
  test("health endpoint responds", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/ru/login");
    await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible();
  });

  test("tutor can open materials", async ({ page }) => {
    test.skip(!tutorEmail || !tutorPassword, "tutor credentials required");
    await login(page, tutorEmail!, tutorPassword!);
    await page.goto("/ru/dashboard/materials");
    await expect(page.getByRole("heading", { name: /Материалы|материалы/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("student can open rooms", async ({ page }) => {
    test.skip(!studentEmail || !studentPassword, "student credentials required");
    await login(page, studentEmail!, studentPassword!);
    await page.goto("/ru/dashboard/rooms");
    await expect(page.getByRole("heading", { name: /Комнаты/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
