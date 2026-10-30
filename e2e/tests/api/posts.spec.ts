import { test, expect } from "@playwright/test";
import { createUser } from "../helpers";

test.describe("API - POSTS", () => {
  test("GET /posts retorna a página solicitada de posts", async ({ request }) => {
    const resp = await request.get("/posts", { params: { limit: 5, skip: 10 } });

    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.posts).toHaveLength(5);
    expect(data.skip).toBe(10);
    expect(data.limit).toBe(5);
    expect(data.total).toBeGreaterThan(0);
    expect(data.posts[0]).toEqual(
      expect.objectContaining({
        id: 11,
        title: expect.any(String),
        body: expect.any(String),
        liked: false,
      })
    );
  });

  test("GET /posts retorna as reactions (likes/dislikes) de cada post iguais às do DummyJSON", async ({
    request,
  }) => {
    const ours = await (await request.get("/posts", { params: { limit: 5, skip: 0 } })).json();
    const dummy = await (
      await request.get("https://dummyjson.com/posts", { params: { limit: 5, skip: 0 } })
    ).json();

    expect(ours.posts.map((p: { id: number; reactions: object }) => [p.id, p.reactions])).toEqual(
      dummy.posts.map((p: { id: number; reactions: object }) => [p.id, p.reactions])
    );
  });

  test("curtir e descurtir um post reflete em /posts e /posts/liked", async ({ request }) => {
    const user = await createUser(request);

    const like = await request.post("/posts/1/like", { params: { userId: user.id } });
    expect(await like.json()).toEqual({ postId: 1, liked: true });

    const feed = await (
      await request.get("/posts", { params: { limit: 2, skip: 0, userId: user.id } })
    ).json();
    expect(feed.posts.find((p: { id: number }) => p.id === 1).liked).toBe(true);
    expect(feed.posts.find((p: { id: number }) => p.id === 2).liked).toBe(false);

    const liked = await (await request.get("/posts/liked", { params: { userId: user.id } })).json();
    expect(liked.total).toBe(1);
    expect(liked.posts[0].id).toBe(1);

    const unlike = await request.post("/posts/1/like", { params: { userId: user.id } });
    expect(await unlike.json()).toEqual({ postId: 1, liked: false });

    const likedAfter = await (
      await request.get("/posts/liked", { params: { userId: user.id } })
    ).json();
    expect(likedAfter.total).toBe(0);
  });

  test("POST /posts/{id}/like retorna 400 sem userId", async ({ request }) => {
    const resp = await request.post("/posts/1/like");

    expect(resp.status()).toBe(400);
  });
});
