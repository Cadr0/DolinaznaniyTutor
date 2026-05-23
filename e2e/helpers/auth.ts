import type { Page } from "@playwright/test";

export const TUTOR_EMAIL = process.env.E2E_TUTOR_EMAIL ?? "marutin8578621@yandex.ru";
export const TUTOR_PASSWORD = process.env.E2E_TUTOR_PASSWORD ?? "Pas857862121pas";
export const STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL ?? "marutin8578621@gmail.com";
export const STUDENT_PASSWORD = process.env.E2E_STUDENT_PASSWORD ?? "Pas857862121pas";
export const E2E_ROOM_ID = process.env.E2E_ROOM_ID ?? "cmphbybup0001ph01iwy4hj3e";

export async function login(page: Page, email: string, password: string) {
  await page.goto("/ru/login");
  await page.getByLabel("Почта").fill(email);
  await page.getByLabel("Пароль").fill(password);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/dashboard**", { timeout: 45_000 });
}

export async function loginAsTutor(page: Page) {
  await login(page, TUTOR_EMAIL, TUTOR_PASSWORD);
}

export async function loginAsStudent(page: Page) {
  await login(page, STUDENT_EMAIL, STUDENT_PASSWORD);
}

export async function gotoHomework(page: Page) {
  await page.goto("/ru/dashboard/homework");
  await page.waitForLoadState("domcontentloaded");
}

export async function openFirstAssignment(page: Page) {
  const assignmentLink = page.getByRole("link").filter({ hasText: /Продолжить|Начать/ }).first();
  const visible = await assignmentLink.isVisible({ timeout: 8_000 }).catch(() => false);
  if (!visible) {
    return false;
  }
  await assignmentLink.click();
  await page.waitForURL("**/dashboard/homework/**", { timeout: 15_000 });
  return true;
}
