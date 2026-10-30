import { render, screen, fireEvent } from "@testing-library/react";
import Home from "@/app/page";
import { AuthProvider } from "@/contexts/AuthContext";
import { postsService } from "@/service/posts/posts";
import { Post } from "@/service/types";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/service/posts/posts");

const mockedPostsService = postsService as jest.Mocked<typeof postsService>;

function makePosts(count: number, startId = 1): Post[] {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    title: `Post ${startId + i}`,
    body: `Conteúdo ${startId + i}`,
    liked: false,
  }));
}

function mockResponse(posts: Post[]) {
  return { posts, total: 30, skip: 0, limit: 10 };
}

function renderHome() {
  return render(
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}

describe("app/Home", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderiza um card para cada post retornado pela API", async () => {
    mockedPostsService.getPosts.mockResolvedValueOnce(mockResponse(makePosts(2)));

    renderHome();

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Post 1")).toBeTruthy();
    expect(screen.getByText("Você chegou ao fim dos posts!")).toBeTruthy();
  });

  test("carrega a próxima página ao clicar em 'Carregar mais'", async () => {
    mockedPostsService.getPosts
      .mockResolvedValueOnce(mockResponse(makePosts(10)))
      .mockResolvedValueOnce(mockResponse(makePosts(3, 11)));

    renderHome();
    fireEvent.click(await screen.findByRole("button", { name: "Carregar mais" }));

    expect(await screen.findByText("Post 13")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(13);
    expect(mockedPostsService.getPosts).toHaveBeenLastCalledWith({
      skip: 10,
      limit: 10,
      userId: undefined,
    });
  });

  test("exibe mensagem quando não há posts", async () => {
    mockedPostsService.getPosts.mockResolvedValueOnce(mockResponse([]));

    renderHome();

    expect(await screen.findByText("Nenhum post encontrado.")).toBeTruthy();
  });

  test("exibe mensagem de erro quando a API falha", async () => {
    mockedPostsService.getPosts.mockRejectedValueOnce(new Error("500"));

    renderHome();

    expect(
      await screen.findByText("Erro ao carregar posts. Tente novamente mais tarde.")
    ).toBeTruthy();
  });
});
