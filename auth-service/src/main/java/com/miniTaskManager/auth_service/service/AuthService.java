package com.miniTaskManager.auth_service.service;

import com.miniTaskManager.auth_service.dto.AuthResponse;
import com.miniTaskManager.auth_service.dto.LoginRequest;
import com.miniTaskManager.auth_service.dto.RegisterRequest;
import com.miniTaskManager.auth_service.entity.User;
import com.miniTaskManager.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("E-mail já cadastrado.");
        }

        // Boa Prática: A senha nunca deve ser salva em texto plano no banco.
        // O PasswordEncoder garante a geração de um hash seguro (ex: BCrypt).
        User user = User.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .build();

        userRepository.save(user);
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getNome());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getNome());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.getSenha(), user.getSenha())) {
            throw new RuntimeException("Credenciais inválidas.");
        }

        // Arquitetura Stateless: Geramos um JWT com as informações do usuário (claims)
        // para que outros serviços (como o task-service) não precisem chamar este serviço
        // novamente a cada requisição apenas para validar a sessão.
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getNome());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getNome());
    }

    public java.util.List<com.miniTaskManager.auth_service.dto.UserDTO> listUsers() {
        return userRepository.findAll().stream()
                .map(user -> com.miniTaskManager.auth_service.dto.UserDTO.builder()
                        .id(user.getId())
                        .nome(user.getNome())
                        .email(user.getEmail())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }
}
