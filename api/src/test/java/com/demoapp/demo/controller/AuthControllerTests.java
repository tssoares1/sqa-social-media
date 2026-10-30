package com.demoapp.demo.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

/** Testes de integração: controller + service + repository com banco H2 em memória. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTests {

  private static final String VALID_PASSWORD = "Password123!";

  @Autowired
  private MockMvc mockMvc;

  private ResultActions postJson(String url, String json) throws Exception {
    return mockMvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(json));
  }

  private ResultActions signup(String email, String password) throws Exception {
    return postJson("/auth/signup", "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password));
  }

  private ResultActions signin(String email, String password) throws Exception {
    return postJson("/auth/signin", "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password));
  }

  @Test
  @DisplayName("POST /auth/signup cria usuário com dados válidos")
  void deveCriarUsuario() throws Exception {
    signup("novo@teste.com", VALID_PASSWORD)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").isNumber())
        .andExpect(jsonPath("$.email").value("novo@teste.com"));
  }

  @Test
  @DisplayName("POST /auth/signup retorna 422 para e-mail inválido")
  void deveRejeitarSignupComEmailInvalido() throws Exception {
    signup("emailinvalido", VALID_PASSWORD)
        .andExpect(status().is(422))
        .andExpect(jsonPath("$.message").value("E-mail inválido"));
  }

  @Test
  @DisplayName("POST /auth/signup retorna 422 para senha fora da política")
  void deveRejeitarSignupComSenhaInvalida() throws Exception {
    signup("novo@teste.com", "123")
        .andExpect(status().is(422))
        .andExpect(jsonPath("$.message").value("Senha inválida"));
  }

  @Test
  @DisplayName("POST /auth/signup retorna 409 quando o e-mail já está em uso")
  void deveRejeitarSignupComEmailDuplicado() throws Exception {
    signup("duplicado@teste.com", VALID_PASSWORD).andExpect(status().isOk());

    signup("duplicado@teste.com", VALID_PASSWORD)
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("E-mail já está em uso"));
  }

  @Test
  @DisplayName("POST /auth/signin autentica com credenciais corretas")
  void deveAutenticarUsuario() throws Exception {
    signup("login@teste.com", VALID_PASSWORD);

    signin("login@teste.com", VALID_PASSWORD)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("login@teste.com"));
  }

  @Test
  @DisplayName("POST /auth/signin retorna 401 para senha incorreta ou usuário inexistente")
  void deveRejeitarCredenciaisInvalidas() throws Exception {
    signup("login@teste.com", VALID_PASSWORD);

    signin("login@teste.com", "Outra123!").andExpect(status().isUnauthorized());
    signin("naoexiste@teste.com", VALID_PASSWORD)
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("Credenciais inválidas"));
  }

  @Test
  @DisplayName("POST /auth/reset-password retorna 200 para usuário cadastrado e 404 caso contrário")
  void deveResetarSenha() throws Exception {
    signup("reset@teste.com", VALID_PASSWORD);

    postJson("/auth/reset-password", "{\"email\":\"reset@teste.com\"}").andExpect(status().isOk());
    postJson("/auth/reset-password", "{\"email\":\"naoexiste@teste.com\"}")
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Usuário não encontrado"));
  }
}
