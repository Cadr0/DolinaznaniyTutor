import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const tutorEmail = process.env.E2E_TUTOR_EMAIL;
const tutorPassword = process.env.E2E_TUTOR_PASSWORD;
const studentEmail = process.env.E2E_STUDENT_EMAIL;
const studentPassword = process.env.E2E_STUDENT_PASSWORD;
const roomId = process.env.E2E_ROOM_ID;

test.describe("homework flow", () => {
  test.skip(
    !tutorEmail || !tutorPassword || !studentEmail || !studentPassword || !roomId,
    "E2E homework credentials and E2E_ROOM_ID required",
  );

  test("student homework page loads after login", async ({ page }) => {
    await login(page, studentEmail!, studentPassword!);
    await page.goto("/ru/dashboard/homework");
    await expect(page.getByRole("heading", { name: /Мои задания|My assignments/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("tutor can open student progress from room", async ({ page }) => {
    await login(page, tutorEmail!, tutorPassword!);
    await page.goto(`/ru/dashboard/rooms/${roomId}`);
    await page.getByRole("button", { name: /Прогресс/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Прогресс ученика|Student progress/i)).toBeVisible();
  });
});
