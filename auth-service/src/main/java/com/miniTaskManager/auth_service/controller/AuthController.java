package com.miniTaskManager.auth_service.controller;

import com.miniTaskManager.auth_service.service.AuthService;
import com.miniTaskManager.auth_service.dto.AuthResponse;
import com.miniTaskManager.auth_service.dto.RegisterRequest;
import com.miniTaskManager.auth_service.dto.LoginRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;  

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/users")
    public ResponseEntity<java.util.List<com.miniTaskManager.auth_service.dto.UserDTO>> listUsers() {
        return ResponseEntity.ok(authService.listUsers());
    }
}
