import { isEmailValid, getEmailValidationMessage } from "@/utils/email";

describe("utils/email", () => {
  test.each(["aluno@teste.com", "  aluno@teste.com.br  "])(
    "isEmailValid aceita e-mail válido: '%s'",
    (email) => {
      expect(isEmailValid(email)).toBe(true);
    }
  );

  test.each(["", "aluno", "aluno@teste", "aluno@.com", "alu no@teste.com"])(
    "isEmailValid rejeita e-mail inválido: '%s'",
    (email) => {
      expect(isEmailValid(email)).toBe(false);
    }
  );

  test("getEmailValidationMessage retorna a mensagem adequada para cada caso", () => {
    expect(getEmailValidationMessage("")).toBe("Email é obrigatório");
    expect(getEmailValidationMessage("aluno")).toBe("Email inválido");
    expect(getEmailValidationMessage("aluno@teste.com")).toBe("");
  });
});
