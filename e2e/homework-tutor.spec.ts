import { test, expect } from "@playwright/test";
import { E2E_ROOM_ID } from "./helpers/auth";

test.describe("tutor homework management", () => {
  test("room shows students with progress action", async ({ page }) => {
    await page.goto(`/ru/dashboard/rooms/${E2E_ROOM_ID}`);
    await expect(page.getByRole("heading", { name: "Ученики" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Прогресс ученика" }).first()).toBeVisible();
  });

  test("open student progress panel", async ({ page }) => {
    await page.goto(`/ru/dashboard/rooms/${E2E_ROOM_ID}`);
    await page.getByRole("button", { name: "Прогресс ученика" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Прогресс ученика")).toBeVisible();
    await expect(page.getByRole("button", { name: "Назначить тему" })).toBeVisible();
  });

  test("assign topic modal replaces progress panel", async ({ page }) => {
    await page.goto(`/ru/dashboard/rooms/${E2E_ROOM_ID}`);
    await page.getByRole("button", { name: "Прогресс ученика" }).first().click();
    await page.getByRole("button", { name: "Назначить тему" }).click();

    const dialogs = page.getByRole("dialog");
    await expect(dialogs).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Назначить тему" })).toBeVisible();
  });

  test("revoke uses inline confirm without browser dialog", async ({ page }) => {
    await page.goto(`/ru/dashboard/rooms/${E2E_ROOM_ID}`);
    await page.getByRole("button", { name: "Прогресс ученика" }).first().click();

    const revokeButton = page.getByRole("button", { name: "Снять назначение" }).first();
    if (!(await revokeButton.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, "No assignments to revoke");
      return;
    }

    page.once("dialog", (dialog) => {
      throw new Error(`Unexpected browser dialog: ${dialog.message()}`);
    });

    await revokeButton.click();
    await expect(page.getByText("Снять назначение?")).toBeVisible();
    await page.getByRole("button", { name: "Отмена" }).click();
  });
});
