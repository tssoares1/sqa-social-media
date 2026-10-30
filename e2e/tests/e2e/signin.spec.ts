import { test, expect } from "@playwright/test";
import { PASSWORD, createUser, uniqueEmail } from "../helpers";

test.describe("E2E - LOGIN E CURTIDAS", () => {
  test("exibe erro ao entrar com credenciais inválidas", async ({ page }) => {
    await page.goto("/signin");

    await page.getByPlaceholder("seu@email.com").fill(uniqueEmail());
    await page.getByPlaceholder("••••••••").fill(PASSWORD);
    await page.locator("form").getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Credenciais inválidas")).toBeVisible();
    await expect(page).toHaveURL(/\/signin$/);
  });

  test("usuário autenticado curte um post e o vê em 'Posts Curtidos'", async ({
    page,
    request,
  }) => {
    const user = await createUser(request);

    await page.goto("/signin");
    await page.getByPlaceholder("seu@email.com").fill(user.email);
    await page.getByPlaceholder("••••••••").fill(PASSWORD);
    await page.locator("form").getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();

    const firstCard = page.getByRole("listitem").first();
    const title = await firstCard.getByRole("heading").textContent();
    await firstCard.getByRole("button", { name: "Curtir" }).click();
    await expect(firstCard.getByRole("button", { name: "Curtido" })).toBeVisible();

    await page.getByRole("button", { name: "Posts Curtidos" }).click();
    await expect(page).toHaveURL(/\/auth\/liked$/);
    await expect(page.getByRole("listitem")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: title! })).toBeVisible();
  });
});
