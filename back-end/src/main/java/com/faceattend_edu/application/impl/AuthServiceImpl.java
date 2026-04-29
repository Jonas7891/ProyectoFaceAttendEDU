package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.service.AuthService;
import com.faceattend_edu.domain.port.UserRepositoryPort;
import com.faceattend_edu.infrastructure.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepositoryPort userRepositoryPort;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepositoryPort userRepositoryPort,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.userRepositoryPort = userRepositoryPort;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional(readOnly = true)
    public String login(String email, String password) {

        var user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!password.equals(user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return jwtService.generateToken(user);
    }
}
