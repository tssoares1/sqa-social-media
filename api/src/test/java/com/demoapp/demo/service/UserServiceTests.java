package com.demoapp.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import com.demoapp.demo.model.User;
import com.demoapp.demo.repository.UserRepository;

class UserServiceTests {

  private UserRepository userRepository;
  private UserService userService;

  @BeforeEach
  void setUp() {
    userRepository = mock(UserRepository.class);
    userService = new UserService(userRepository);
  }

  @Test
  @DisplayName("Aceita e-mail que contém @")
  void deveAceitarEmailComArroba() {
    assertTrue(userService.isEmailValid("aluno@teste.com"));
  }

  @Test
  @DisplayName("Rejeita e-mail nulo ou sem @")
  void deveRejeitarEmailNuloOuSemArroba() {
    assertFalse(userService.isEmailValid(null));
    assertFalse(userService.isEmailValid("aluno.teste.com"));
  }

  @ParameterizedTest
  @ValueSource(strings = { "Password123!", "Passw0r!" })
  @DisplayName("Aceita senha com 8+ caracteres, maiúscula, minúscula, dígito e caractere especial")
  void deveAceitarSenhaValida(String password) {
    assertTrue(userService.isPasswordValid(password));
  }

  @ParameterizedTest
  @ValueSource(strings = { "password123!", "PASSWORD123!", "Password!!!", "Password123", "Pa1!" })
  @DisplayName("Rejeita senha sem maiúscula, sem minúscula, sem dígito, sem especial ou curta")
  void deveRejeitarSenhaInvalida(String password) {
    assertFalse(userService.isPasswordValid(password));
  }

  @Test
  @DisplayName("createUser persiste o usuário com e-mail e senha informados")
  void deveCriarUsuario() {
    when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

    User user = userService.createUser("aluno@teste.com", "Password123!");

    assertEquals("aluno@teste.com", user.getEmail());
    assertEquals("Password123!", user.getPassword());
    verify(userRepository).save(user);
  }

  @Test
  @DisplayName("findByEmail retorna o usuário quando existe e null quando não existe")
  void deveBuscarUsuarioPorEmail() {
    User existing = new User();
    existing.setEmail("aluno@teste.com");
    when(userRepository.findByEmail("aluno@teste.com")).thenReturn(Optional.of(existing));
    when(userRepository.findByEmail("outro@teste.com")).thenReturn(Optional.empty());

    assertSame(existing, userService.findByEmail("aluno@teste.com"));
    assertNull(userService.findByEmail("outro@teste.com"));
  }
}
