import type { Page } from "@playwright/test";

export function getE2ECredentials() {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

export async function loginViaUi(page: Page) {
  const credentials = getE2ECredentials();
  if (!credentials) {
    throw new Error("E2E_TEST_EMAIL / E2E_TEST_PASSWORD no configurados");
  }

  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Contraseña").fill(credentials.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
}
