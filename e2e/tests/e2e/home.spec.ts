import { test, expect } from "@playwright/test";

test.describe("E2E - HOME", () => {
  test("exibe o feed com 10 posts e carrega mais ao clicar em 'Carregar mais'", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Feed de Posts" })).toBeVisible();
    const cards = page.getByRole("listitem");
    await expect(cards).toHaveCount(10);

    await page.getByRole("button", { name: "Carregar mais" }).click();
    await expect(cards).toHaveCount(20);
  });

  test("usuário deslogado vê alerta ao tentar curtir um post", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();

    // O alert bloqueia o clique até ser aceito, então ele é tratado dentro do listener
    let message = "";
    page.once("dialog", (dialog) => {
      message = dialog.message();
      return dialog.accept();
    });
    await page.getByRole("button", { name: "Curtir" }).first().click();

    expect(message).toBe("Você precisa estar autenticado para curtir posts!");
  });
});
