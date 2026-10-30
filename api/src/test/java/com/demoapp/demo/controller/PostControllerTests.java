package com.demoapp.demo.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/** Testes de integração das rotas de posts que não dependem da API externa (DummyJSON). */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PostControllerTests {

  @Autowired
  private MockMvc mockMvc;

  @Test
  @DisplayName("POST /posts/{id}/like alterna entre curtir e descurtir")
  void deveAlternarCurtida() throws Exception {
    mockMvc.perform(post("/posts/7/like").param("userId", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.postId").value(7))
        .andExpect(jsonPath("$.liked").value(true));

    mockMvc.perform(post("/posts/7/like").param("userId", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.liked").value(false));
  }

  @Test
  @DisplayName("POST /posts/{id}/like retorna 400 sem userId")
  void deveExigirUserIdAoCurtir() throws Exception {
    mockMvc.perform(post("/posts/7/like")).andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("GET /posts/liked retorna lista vazia para usuário sem curtidas")
  void deveRetornarListaVaziaSemCurtidas() throws Exception {
    mockMvc.perform(get("/posts/liked").param("userId", "999"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.posts").isEmpty())
        .andExpect(jsonPath("$.total").value(0));
  }
}
