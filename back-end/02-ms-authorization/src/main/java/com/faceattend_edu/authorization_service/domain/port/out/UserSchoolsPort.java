package com.faceattend_edu.authorization_service.domain.port.out;

import java.util.Set;

/**
 * School ids of a user, as Identity and Academic report them to the current caller. Empty when
 * the user has no person or actor, or lies outside the caller's scope.
 */
public interface UserSchoolsPort {
    Set<Integer> schoolsOf(String userId);
}
