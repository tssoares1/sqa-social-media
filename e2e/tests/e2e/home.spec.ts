import { test, expect } from "@playwright/test";
import { API_URL } from "../helpers";

test.describe("E2E - HOME", () => {
  test("exibe curtidas e descurtidas junto a cada post", async ({ page, request }) => {
    const { posts } = await (
      await request.get(`${API_URL}/posts`, { params: { limit: 10, skip: 0 } })
    ).json();

    await page.goto("/");
    const cards = page.getByRole("listitem");
    await expect(cards).toHaveCount(posts.length);

    for (const [i, post] of posts.entries()) {
      const card = cards.nth(i);
      await expect(card.getByRole("heading")).toHaveText(post.title);
      await expect(card.getByTitle("Curtidas", { exact: true })).toHaveText(
        `👍 ${post.reactions.likes}`
      );
      await expect(card.getByTitle("Descurtidas", { exact: true })).toHaveText(
        `👎 ${post.reactions.dislikes}`
      );
    }
  });

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
