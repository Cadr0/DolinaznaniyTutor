import { test, expect } from "@playwright/test";
import path from "path";
import { gotoHomework, openFirstAssignment } from "./helpers/auth";

test.describe("student homework flow", () => {
  test("homework hub loads", async ({ page }) => {
    await gotoHomework(page);
    await expect(page.getByRole("heading", { name: "Мои задания" })).toBeVisible();
  });

  test("empty state or assignment cards", async ({ page }) => {
    await gotoHomework(page);
    const empty = page.getByText("Пока нет назначенных тем");
    const card = page.getByRole("link").filter({ hasText: /Продолжить|Начать/ });
    await expect(empty.or(card.first())).toBeVisible({ timeout: 10_000 });
  });

  test("skip task without browser confirm dialog", async ({ page }) => {
    await gotoHomework(page);
    const opened = await openFirstAssignment(page);
    if (!opened) {
      test.skip(true, "No assignments for student");
      return;
    }

    page.once("dialog", (dialog) => {
      throw new Error(`Unexpected dialog: ${dialog.message()}`);
    });

    await expect(page.getByRole("button", { name: "Пропустить" })).toBeVisible({ timeout: 15_000 });
    const taskUrlBefore = page.url();
    await page.getByRole("button", { name: "Пропустить" }).click();
    await expect(page).not.toHaveURL(taskUrlBefore, { timeout: 20_000 });
  });

  test("wrong answer shows error and stays on task", async ({ page }) => {
    await gotoHomework(page);
    const opened = await openFirstAssignment(page);
    if (!opened) {
      test.skip(true, "No assignments");
      return;
    }

    const textarea = page.getByPlaceholder("Введите ответ");
    if (!(await textarea.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, "Current task is not TEXT type");
      return;
    }

    const urlBefore = page.url();
    await textarea.fill("__wrong_answer_e2e__");
    await page.getByRole("button", { name: "Проверить" }).click();
    await expect(page.getByText("Ошибка. Попробуйте ещё раз.")).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(urlBefore);
  });

  test("hint button reveals hint block", async ({ page }) => {
    await gotoHomework(page);
    const opened = await openFirstAssignment(page);
    if (!opened) {
      test.skip(true, "No assignments");
      return;
    }

    await page.getByRole("button", { name: "Подсказка" }).click();
    await expect(page.getByText(/Подсказка|Подсказки нет/)).toBeVisible({ timeout: 10_000 });
  });

  test("photo upload on IMAGE task", async ({ page }) => {
    await gotoHomework(page);
    const opened = await openFirstAssignment(page);
    if (!opened) {
      test.skip(true, "No assignments");
      return;
    }

    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) === 0) {
      test.skip(true, "No IMAGE task in queue");
      return;
    }

    const fixture = path.join(__dirname, "fixtures", "test-photo.png");
    await fileInput.setInputFiles(fixture);
    await expect(page.getByText(/EACCES|permission denied/i)).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Проверить" })).toBeVisible();
  });

  test("progress page loads", async ({ page }) => {
    await page.goto("/ru/dashboard/progress");
    await expect(page.getByRole("heading", { name: "Ваш прогресс" })).toBeVisible();
  });
});
