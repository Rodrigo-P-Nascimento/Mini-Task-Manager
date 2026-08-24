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

        User user = User.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .build();

        userRepository.save(user);
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getNome());
        return new AuthResponse(token, user.getId(), user.getNome(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.getSenha(), user.getSenha())) {
            throw new RuntimeException("Credenciais inválidas.");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getNome());
        return new AuthResponse(token, user.getId(), user.getNome(), user.getEmail());
    }
}
