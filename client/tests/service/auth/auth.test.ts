import { authService } from "@/service/auth/auth";
import api from "@/service/api";

jest.mock("@/service/api");

const mockedApi = api as jest.Mocked<typeof api>;

describe("service/auth", () => {
  const credentials = { email: "aluno@teste.com", password: "Teste123@" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("signIn faz POST em /auth/signin e retorna o usuário", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: 1, email: credentials.email } });

    const user = await authService.signIn(credentials);

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/signin", credentials);
    expect(user).toEqual({ id: 1, email: credentials.email });
  });

  test("signUp faz POST em /auth/signup e retorna o usuário criado", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: 2, email: credentials.email } });

    const user = await authService.signUp(credentials);

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/signup", credentials);
    expect(user).toEqual({ id: 2, email: credentials.email });
  });

  test("resetPassword faz POST em /auth/reset-password com o e-mail", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: {} });

    await authService.resetPassword({ email: credentials.email });

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/reset-password", {
      email: credentials.email,
    });
  });

  test("propaga o erro da API", async () => {
    mockedApi.post.mockRejectedValueOnce(new Error("401"));

    await expect(authService.signIn(credentials)).rejects.toThrow("401");
  });
});
