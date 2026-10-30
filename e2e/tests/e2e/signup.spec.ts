import { test, expect } from "@playwright/test";
import { PASSWORD, uniqueEmail } from "../helpers";

test.describe("E2E - CRIAR CONTA", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Criar Conta" }).click();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("cria conta com dados válidos e redireciona para a home autenticado", async ({ page }) => {
    await page.getByPlaceholder("seu@email.com").fill(uniqueEmail());
    await page.getByPlaceholder("••••••••").nth(0).fill(PASSWORD);
    await page.getByPlaceholder("••••••••").nth(1).fill(PASSWORD);
    await page.locator("form").getByRole("button", { name: "Criar Conta" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
  });

  test("exibe erros de validação para e-mail inválido e senhas diferentes", async ({ page }) => {
    // "aluno@teste" passa na validação nativa do input type=email, mas não na regra da aplicação
    await page.getByPlaceholder("seu@email.com").fill("aluno@teste");
    await page.getByPlaceholder("••••••••").nth(0).fill(PASSWORD);
    await page.getByPlaceholder("••••••••").nth(1).fill("Outra123@");
    await page.locator("form").getByRole("button", { name: "Criar Conta" }).click();

    await expect(page.getByText("Email inválido")).toBeVisible();
    await expect(page.getByText("As senhas não coincidem")).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
  });
});
