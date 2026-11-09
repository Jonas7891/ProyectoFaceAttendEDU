package com.faceattend_edu.authorization_service.infrastructure.client;

import com.faceattend_edu.authorization_service.domain.port.out.UserSchoolsPort;
import com.faceattend_edu.shared.auth.UserSchools;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Set;

/**
 * Asks Identity and Academic with the current caller's own bearer token, so the answer is
 * limited to what that caller may see. Without a bearer token there is nobody to ask for, and
 * no school is returned (the policy then denies).
 */
@Component
@RequiredArgsConstructor
public class UserSchoolsAdapter implements UserSchoolsPort {

    private final UserSchools userSchools;

    @Override
    public Set<Integer> schoolsOf(String userId) {
        String token = currentBearerToken();
        return token == null ? Set.of() : userSchools.of(userId, token);
    }

    private static String currentBearerToken() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) return null;
        String header = attributes.getRequest().getHeader("Authorization");
        if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) return null;
        String token = header.substring(7).trim();
        return token.isEmpty() ? null : token;
    }
}
