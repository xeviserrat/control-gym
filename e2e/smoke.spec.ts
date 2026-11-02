import { expect, test } from "@playwright/test";

test.describe("smoke (sin sesión)", () => {
  test("muestra la pantalla de login", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("protege rutas de la app", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("sirve el manifest PWA sin redirección", async ({ request }) => {
    const response = await request.get("/manifest.json");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/json/);

    const body = await response.json();
    expect(body.name).toBe("Control Gym");
  });
});
