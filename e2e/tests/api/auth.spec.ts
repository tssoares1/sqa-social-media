import { test, expect } from "@playwright/test";
import { PASSWORD, createUser, uniqueEmail } from "../helpers";

test.describe("API - AUTH", () => {
  test("POST /auth/signup cria usuário com dados válidos", async ({ request }) => {
    const email = uniqueEmail();

    const resp = await request.post("/auth/signup", { data: { email, password: PASSWORD } });

    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(typeof body.id).toBe("number");
    expect(body.email).toBe(email);
  });

  test("POST /auth/signup retorna 422 para e-mail inválido", async ({ request }) => {
    const resp = await request.post("/auth/signup", {
      data: { email: "emailinvalido", password: PASSWORD },
    });

    expect(resp.status()).toBe(422);
    expect((await resp.json()).message).toBe("E-mail inválido");
  });

  test("POST /auth/signup retorna 422 para senha fora da política", async ({ request }) => {
    const resp = await request.post("/auth/signup", {
      data: { email: uniqueEmail(), password: "123456" },
    });

    expect(resp.status()).toBe(422);
    expect((await resp.json()).message).toBe("Senha inválida");
  });

  test("POST /auth/signup retorna 409 para e-mail já cadastrado", async ({ request }) => {
    const user = await createUser(request);

    const resp = await request.post("/auth/signup", {
      data: { email: user.email, password: PASSWORD },
    });

    expect(resp.status()).toBe(409);
    expect((await resp.json()).message).toBe("E-mail já está em uso");
  });

  test("POST /auth/signin autentica com credenciais corretas", async ({ request }) => {
    const user = await createUser(request);

    const resp = await request.post("/auth/signin", {
      data: { email: user.email, password: PASSWORD },
    });

    expect(resp.status()).toBe(200);
    expect(await resp.json()).toMatchObject({ id: user.id, email: user.email });
  });

  test("POST /auth/signin retorna 401 para senha incorreta", async ({ request }) => {
    const user = await createUser(request);

    const resp = await request.post("/auth/signin", {
      data: { email: user.email, password: "Errada123@" },
    });

    expect(resp.status()).toBe(401);
    expect((await resp.json()).message).toBe("Credenciais inválidas");
  });

  test("POST /auth/reset-password responde 200 para cadastrado e 404 para desconhecido", async ({
    request,
  }) => {
    const user = await createUser(request);

    const ok = await request.post("/auth/reset-password", { data: { email: user.email } });
    const notFound = await request.post("/auth/reset-password", {
      data: { email: uniqueEmail() },
    });

    expect(ok.status()).toBe(200);
    expect(notFound.status()).toBe(404);
    expect((await notFound.json()).message).toBe("Usuário não encontrado");
  });
});
