package com.faceattend_edu.authorization_service.domain.port.in;

import com.faceattend_edu.authorization_service.domain.model.Role;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface GetUserRolesUseCase {
    /** Most user ids one batch accepts: it keeps the query string short and bounds the IN clause. */
    int MAX_BATCH_USERS = 300;

    List<Role> rolesOf(UUID userId);

    /** Roles of each user; users without an assignment are absent from the map. */
    Map<UUID, List<Role>> rolesOf(Collection<UUID> userIds);
}
