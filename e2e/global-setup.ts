import { chromium, type FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";
import {
  STUDENT_EMAIL,
  STUDENT_PASSWORD,
  TUTOR_EMAIL,
  TUTOR_PASSWORD,
} from "./helpers/auth";

const authDir = path.join(__dirname, ".auth");

async function saveAuthState(
  baseURL: string,
  email: string,
  password: string,
  fileName: string,
) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  await page.goto("/ru/login");
  await page.getByLabel("Почта").fill(email);
  await page.getByLabel("Пароль").fill(password);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/dashboard**", { timeout: 45_000, waitUntil: "domcontentloaded" });

  fs.mkdirSync(authDir, { recursive: true });
  await context.storageState({ path: path.join(authDir, fileName) });
  await browser.close();
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3000";

  await saveAuthState(baseURL, TUTOR_EMAIL, TUTOR_PASSWORD, "tutor.json");
  await saveAuthState(baseURL, STUDENT_EMAIL, STUDENT_PASSWORD, "student.json");
}
