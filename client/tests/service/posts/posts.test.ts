import { postsService } from "@/service/posts/posts";
import api from "@/service/api";

jest.mock("@/service/api");

const mockedApi = api as jest.Mocked<typeof api>;

describe("service/posts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getPosts usa limit=10 e skip=0 por padrão", async () => {
    const data = { posts: [], total: 0, skip: 0, limit: 10 };
    mockedApi.get.mockResolvedValueOnce({ data });

    const result = await postsService.getPosts({});

    expect(mockedApi.get).toHaveBeenCalledWith("/posts", {
      params: { limit: 10, skip: 0, userId: undefined },
    });
    expect(result).toEqual(data);
  });

  test("getPosts repassa paginação e userId", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { posts: [] } });

    await postsService.getPosts({ skip: 20, limit: 5, userId: 3 });

    expect(mockedApi.get).toHaveBeenCalledWith("/posts", {
      params: { limit: 5, skip: 20, userId: 3 },
    });
  });

  test("getLikedPosts busca /posts/liked do usuário", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { posts: [], total: 0, limit: 10 } });

    await postsService.getLikedPosts({ userId: 3 });

    expect(mockedApi.get).toHaveBeenCalledWith("/posts/liked", {
      params: { userId: 3, limit: 10 },
    });
  });

  test("toggleLikePost faz POST em /posts/{id}/like com userId", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { postId: 7, liked: true } });

    await postsService.toggleLikePost({ postId: 7, userId: 3 });

    expect(mockedApi.post).toHaveBeenCalledWith("/posts/7/like", null, {
      params: { userId: 3 },
    });
  });
});
