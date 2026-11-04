package com.faceattend_edu.identity_service.application.port.in;

public interface ValidatePasswordPolicyUseCase {

    /**
     * Checks a password chosen by a person against the policy in force
     * ({@code identity.password_policy}). The rejection message names the broken rule and never
     * echoes the password.
     *
     * @throws com.faceattend_edu.identity_service.domain.exception.ValidationException (HTTP 400)
     */
    void validate(String password);
}
