import { render, screen, fireEvent } from "@testing-library/react";
import PostCard from "@/components/PostCard";
import { Post } from "@/service/types";

const post: Post = {
  id: 1,
  title: "Título do post",
  body: "Conteúdo do post",
  liked: false,
};

describe("components/PostCard", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  test("exibe título e conteúdo do post", () => {
    render(<PostCard post={post} isAuthenticated={false} onLike={jest.fn()} />);

    expect(screen.getByRole("heading", { name: "Título do post" })).toBeTruthy();
    expect(screen.getByText("Conteúdo do post")).toBeTruthy();
  });

  test("exibe 'Curtido' quando o post já foi curtido", () => {
    render(
      <PostCard post={{ ...post, liked: true }} isAuthenticated onLike={jest.fn()} />
    );

    expect(screen.getByRole("button", { name: /Curtido/ })).toBeTruthy();
  });

  test("alerta e não chama onLike quando o usuário não está autenticado", () => {
    const onLike = jest.fn();
    render(<PostCard post={post} isAuthenticated={false} onLike={onLike} />);

    fireEvent.click(screen.getByRole("button", { name: /Curtir/ }));

    expect(alertSpy).toHaveBeenCalledWith(
      "Você precisa estar autenticado para curtir posts!"
    );
    expect(onLike).not.toHaveBeenCalled();
  });

  test("chama onLike e alterna para 'Curtido' quando autenticado", async () => {
    const onLike = jest.fn().mockResolvedValue(undefined);
    render(<PostCard post={post} isAuthenticated onLike={onLike} />);

    fireEvent.click(screen.getByRole("button", { name: /Curtir/ }));

    expect(onLike).toHaveBeenCalledWith(1);
    expect(await screen.findByRole("button", { name: /Curtido/ })).toBeTruthy();
  });

  test("reverte a curtida e alerta quando onLike falha", async () => {
    const onLike = jest.fn().mockRejectedValue(new Error("falha"));
    render(<PostCard post={post} isAuthenticated onLike={onLike} />);

    fireEvent.click(screen.getByRole("button", { name: /Curtir/ }));

    expect(await screen.findByRole("button", { name: /Curtir/ })).toBeTruthy();
    expect(alertSpy).toHaveBeenCalledWith("Erro ao curtir post. Tente novamente.");
  });
});
