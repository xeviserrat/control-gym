import { expect, test } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const hasCredentials = Boolean(email && password);

test.describe("auth", () => {
  test.beforeEach(() => {
    test.skip(!hasCredentials, "Define E2E_TEST_EMAIL y E2E_TEST_PASSWORD");
  });

  test("login llega al dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Contraseña").fill(password!);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
