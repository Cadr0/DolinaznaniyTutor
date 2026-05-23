import { test, expect } from "@playwright/test";
import { loginAsStudent, loginAsTutor } from "./helpers/auth";

test.describe("auth smoke", () => {
  test("tutor credentials work", async ({ page }) => {
    await loginAsTutor(page);
    await expect(page).toHaveURL(/dashboard/);
  });

  test("student credentials work", async ({ page }) => {
    await loginAsStudent(page);
    await expect(page).toHaveURL(/dashboard/);
  });
});
