package com.faceattend_edu.authorization_service.domain.model;

import com.faceattend_edu.shared.auth.Roles;
import java.util.List;

/**
 * Who is asking, as the gateway filter resolved it: the caller's own user id (null when the
 * request carries none) and the role names propagated as X-User-Roles.
 */
public record Caller(String userId, List<String> roleNames) {

    public static final String SUPER_ADMIN = Roles.SUPER_ADMIN;
    public static final String SCHOOL_ADMIN = Roles.SCHOOL_ADMIN;

    public Caller {
        roleNames = roleNames == null ? List.of() : List.copyOf(roleNames);
    }

    public boolean isSuperAdmin() {
        return roleNames.contains(SUPER_ADMIN);
    }
}
