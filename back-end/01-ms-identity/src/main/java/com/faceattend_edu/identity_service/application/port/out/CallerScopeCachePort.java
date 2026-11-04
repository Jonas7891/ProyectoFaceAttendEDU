package com.faceattend_edu.identity_service.application.port.out;

import java.util.UUID;

/**
 * The people a caller may see are cached for a short while. A flow that adds someone to the
 * caller's school (account provisioning) drops that entry so the next check, made by another
 * service with the same session, already sees the new person.
 */
public interface CallerScopeCachePort {

    void invalidate(UUID userId);
}
