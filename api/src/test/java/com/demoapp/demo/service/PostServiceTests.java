package com.demoapp.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.demoapp.demo.model.UserPostReaction;
import com.demoapp.demo.repository.UserPostReactionRepository;

class PostServiceTests {

  private static final String POSTS_JSON = """
      {
        "posts": [
          { "id": 1, "title": "Post 1", "body": "Body 1", "reactions": { "likes": 192, "dislikes": 25 } },
          { "id": 2, "title": "Post 2", "body": "Body 2", "reactions": { "likes": 7, "dislikes": 0 } }
        ],
        "total": 251, "skip": 0, "limit": 2
      }
      """;

  private UserPostReactionRepository reactionRepository;
  private RestTemplate restTemplate;
  private PostService postService;

  @BeforeEach
  void setUp() {
    reactionRepository = mock(UserPostReactionRepository.class);
    restTemplate = mock(RestTemplate.class);
    postService = new PostService(reactionRepository);
    ReflectionTestUtils.setField(postService, "restTemplate", restTemplate);
  }

  private static UserPostReaction reaction(Long userId, Long postId) {
    UserPostReaction r = new UserPostReaction();
    r.setUserId(userId);
    r.setPostId(postId);
    return r;
  }

  private static String postJson(long id) {
    return """
        { "id": %d, "title": "Post %d", "body": "Body %d", "reactions": { "likes": 1, "dislikes": 2 } }
        """.formatted(id, id, id);
  }

  @Test
  @DisplayName("getPosts monta a URL com limit/skip e marca como curtidos os posts do usuário")
  @SuppressWarnings("unchecked")
  void deveBuscarPostsEMarcarCurtidos() {
    when(restTemplate.getForObject("https://dummyjson.com/posts?limit=2&skip=0", String.class))
        .thenReturn(POSTS_JSON);
    when(reactionRepository.findByUserId(10L)).thenReturn(List.of(reaction(10L, 2L)));

    Map<String, Object> result = postService.getPosts(2, 0, 10L);

    List<Map<String, Object>> posts = (List<Map<String, Object>>) result.get("posts");
    assertEquals(2, posts.size());
    assertEquals(1L, posts.get(0).get("id"));
    assertEquals("Post 1", posts.get(0).get("title"));
    assertEquals(false, posts.get(0).get("liked"));
    assertEquals(true, posts.get(1).get("liked"));
    assertEquals(251, result.get("total"));
    assertEquals(0, result.get("skip"));
    assertEquals(2, result.get("limit"));
  }

  @Test
  @DisplayName("getPosts expõe as reações (likes/dislikes) do DummyJSON em cada post")
  @SuppressWarnings("unchecked")
  void deveExporReacoesDosPosts() {
    when(restTemplate.getForObject("https://dummyjson.com/posts?limit=2&skip=0", String.class))
        .thenReturn(POSTS_JSON);

    Map<String, Object> result = postService.getPosts(2, 0, null);

    List<Map<String, Object>> posts = (List<Map<String, Object>>) result.get("posts");
    assertEquals(Map.of("likes", 192, "dislikes", 25), posts.get(0).get("reactions"));
    assertEquals(Map.of("likes", 7, "dislikes", 0), posts.get(1).get("reactions"));
  }

  @Test
  @DisplayName("getPosts usa 0 likes/dislikes quando o post não possui reactions")
  @SuppressWarnings("unchecked")
  void deveUsarZeroQuandoPostNaoTemReacoes() {
    when(restTemplate.getForObject("https://dummyjson.com/posts", String.class)).thenReturn("""
        { "posts": [ { "id": 1, "title": "Post 1", "body": "Body 1" } ], "total": 1, "skip": 0, "limit": 1 }
        """);

    Map<String, Object> result = postService.getPosts(null, null, null);

    List<Map<String, Object>> posts = (List<Map<String, Object>>) result.get("posts");
    assertEquals(Map.of("likes", 0, "dislikes", 0), posts.get(0).get("reactions"));
  }

  @Test
  @DisplayName("getPosts sem userId não consulta curtidas e retorna todos como não curtidos")
  @SuppressWarnings("unchecked")
  void deveBuscarPostsSemUsuario() {
    when(restTemplate.getForObject("https://dummyjson.com/posts", String.class)).thenReturn(POSTS_JSON);

    Map<String, Object> result = postService.getPosts(null, null, null);

    List<Map<String, Object>> posts = (List<Map<String, Object>>) result.get("posts");
    assertTrue(posts.stream().noneMatch(p -> (Boolean) p.get("liked")));
    verifyNoInteractions(reactionRepository);
  }

  @Test
  @DisplayName("getPosts encapsula falha da API externa em RuntimeException")
  void deveLancarExcecaoQuandoApiExternaFalha() {
    when(restTemplate.getForObject(anyString(), eq(String.class)))
        .thenThrow(new RestClientException("timeout"));

    RuntimeException ex = assertThrows(RuntimeException.class, () -> postService.getPosts(5, 0, null));
    assertTrue(ex.getMessage().startsWith("Erro ao buscar posts"));
  }

  @Test
  @DisplayName("getLikedPosts pagina os posts curtidos e busca cada um na API externa")
  @SuppressWarnings("unchecked")
  void devePaginarPostsCurtidos() {
    when(reactionRepository.findByUserId(10L))
        .thenReturn(List.of(reaction(10L, 3L), reaction(10L, 5L), reaction(10L, 8L)));
    when(restTemplate.getForObject("https://dummyjson.com/posts/5", String.class)).thenReturn(postJson(5));
    when(restTemplate.getForObject("https://dummyjson.com/posts/8", String.class)).thenReturn(postJson(8));

    Map<String, Object> result = postService.getLikedPosts(10L, 2, 1);

    List<Map<String, Object>> posts = (List<Map<String, Object>>) result.get("posts");
    assertEquals(List.of(5L, 8L), posts.stream().map(p -> p.get("id")).toList());
    assertTrue(posts.stream().allMatch(p -> (Boolean) p.get("liked")));
    assertEquals(Map.of("likes", 1, "dislikes", 2), posts.get(0).get("reactions"));
    assertEquals(3, result.get("total"));
    verify(restTemplate, never()).getForObject("https://dummyjson.com/posts/3", String.class);
  }

  @Test
  @DisplayName("getLikedPosts usa limit=5 e skip=0 por padrão")
  void deveUsarPaginacaoPadraoEmPostsCurtidos() {
    when(reactionRepository.findByUserId(10L)).thenReturn(List.of());

    Map<String, Object> result = postService.getLikedPosts(10L, null, null);

    assertEquals(5, result.get("limit"));
    assertEquals(0, result.get("skip"));
    assertEquals(0, result.get("total"));
  }

  @Test
  @DisplayName("toggleLike cria a curtida quando o usuário ainda não curtiu o post")
  void deveCurtirPost() {
    when(reactionRepository.findByUserIdAndPostId(10L, 1L)).thenReturn(Optional.empty());

    Map<String, Object> result = postService.toggleLike(1L, 10L);

    assertEquals(true, result.get("liked"));
    assertEquals(1L, result.get("postId"));
    verify(reactionRepository).save(any(UserPostReaction.class));
  }

  @Test
  @DisplayName("toggleLike remove a curtida quando o usuário já curtiu o post")
  void deveDescurtirPost() {
    UserPostReaction existing = reaction(10L, 1L);
    when(reactionRepository.findByUserIdAndPostId(10L, 1L)).thenReturn(Optional.of(existing));

    Map<String, Object> result = postService.toggleLike(1L, 10L);

    assertEquals(false, result.get("liked"));
    verify(reactionRepository).delete(existing);
    verify(reactionRepository, never()).save(any());
  }
}
