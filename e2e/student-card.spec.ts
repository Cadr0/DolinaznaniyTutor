import { test, expect } from "@playwright/test";
import { E2E_ROOM_ID } from "./helpers/auth";

test.describe("tutor student card", () => {
  test("students page loads", async ({ page }) => {
    await page.goto("/ru/dashboard/students");
    await expect(page.getByRole("heading", { name: "Мои ученики" })).toBeVisible();
  });

  test("room progress modal opens with full card link", async ({ page }) => {
    await page.goto(`/ru/dashboard/rooms/${E2E_ROOM_ID}`);
    await page.getByRole("button", { name: "Прогресс ученика" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Полная карточка")).toBeVisible();
  });

  test("review page loads", async ({ page }) => {
    await page.goto("/ru/dashboard/review");
    await expect(page.getByRole("heading", { name: "Проверка работ" })).toBeVisible();
  });
});
