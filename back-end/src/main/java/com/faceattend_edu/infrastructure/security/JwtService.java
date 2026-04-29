package com.faceattend_edu.infrastructure.security;

import com.faceattend_edu.domain.model.User;
import com.faceattend_edu.domain.port.UserRoleRepositoryPort;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final String SECRET = "c2VjcmV0X2tleV9xdWVfZGViZV9zZXJfbXV5X2xhcmdh";
    private final UserRoleRepositoryPort userRoleRepositoryPort;

    public JwtService(UserRoleRepositoryPort userRoleRepositoryPort) {
        this.userRoleRepositoryPort = userRoleRepositoryPort;
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        // Email está en Person, no directamente en User
        String email = user.getPerson().getEmail();

        // Buscar roles activos desde el repositorio
        List<String> roles = userRoleRepositoryPort
                .findActiveRolesByUserId(user.getId())
                .stream()
                .map(ur -> ur.getRole().getName())
                .toList();

        return Jwts.builder()
                .setSubject(email)
                .claim("roles", roles)
                .claim("userId", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24h
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public List<String> extractRoles(String token) {
        return extractAllClaims(token).get("roles", List.class);
    }

    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    public boolean isTokenValid(String token, String email) {
        return extractUsername(token).equals(email) && !isTokenExpired(token);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}