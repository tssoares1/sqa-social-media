import {
  isPasswordValid,
  getPasswordValidationMessage,
} from "@/utils/password";

describe("utils/password", () => {
  test("isPasswordValid aceita senha que atende a todos os requisitos", () => {
    expect(isPasswordValid("Teste123@")).toBe(true);
  });

  test.each([
    ["vazia", ""],
    ["curta", "Te1@"],
    ["sem maiúscula", "teste123@"],
    ["sem minúscula", "TESTE123@"],
    ["sem número", "TesteTeste@"],
    ["sem caractere especial", "Teste12345"],
  ])("isPasswordValid rejeita senha %s", (_, password) => {
    expect(isPasswordValid(password)).toBe(false);
  });

  test("getPasswordValidationMessage exige senha quando vazia", () => {
    expect(getPasswordValidationMessage("")).toBe("Senha é obrigatória");
  });

  test("getPasswordValidationMessage lista todos os requisitos não atendidos", () => {
    expect(getPasswordValidationMessage("abc")).toBe(
      "A senha deve conter: mínimo de 8 caracteres, uma letra maiúscula, um número, um caractere especial"
    );
  });

  test("getPasswordValidationMessage retorna vazio para senha válida", () => {
    expect(getPasswordValidationMessage("Teste123@")).toBe("");
  });
});
