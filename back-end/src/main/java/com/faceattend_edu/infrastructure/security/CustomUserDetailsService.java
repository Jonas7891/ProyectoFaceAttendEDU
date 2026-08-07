package com.faceattend_edu.infrastructure.security;

import com.faceattend_edu.domain.model.User;
import com.faceattend_edu.domain.port.UserRepositoryPort;
import com.faceattend_edu.domain.port.UserRoleRepositoryPort;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepositoryPort userRepositoryPort;
    private final UserRoleRepositoryPort userRoleRepositoryPort;

    public CustomUserDetailsService(UserRepositoryPort userRepositoryPort,
                                    UserRoleRepositoryPort userRoleRepositoryPort) {
        this.userRepositoryPort = userRepositoryPort;
        this.userRoleRepositoryPort = userRoleRepositoryPort;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // 1. Buscar el User por email (que está en Person)
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado con email: " + email
                ));

        // 2. Buscar sus roles activos via UserRoleRepositoryPort
        var authorities = userRoleRepositoryPort
                .findActiveRolesByUserId(user.getId())
                .stream()
                .map(ur -> new SimpleGrantedAuthority(ur.getRole().getName()))
                .toList();

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(email)
                .password(user.getPassword())
                .authorities(authorities)
                .build();
    }
}