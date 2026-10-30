import { APIRequestContext, expect } from "@playwright/test";

export const API_URL = process.env.API_URL ?? "http://localhost:8080";
export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
export const PASSWORD = "Teste123@";

export function uniqueEmail() {
  return `teste${Date.now()}${Math.floor(Math.random() * 1000)}@teste.com`;
}

export async function createUser(request: APIRequestContext) {
  const email = uniqueEmail();
  const resp = await request.post(`${API_URL}/auth/signup`, {
    data: { email, password: PASSWORD },
  });
  expect(resp.ok()).toBeTruthy();
  return (await resp.json()) as { id: number; email: string };
}
