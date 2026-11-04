package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.ValidatePasswordPolicyUseCase;
import com.faceattend_edu.identity_service.application.port.out.ListPasswordPoliciesPort;
import com.faceattend_edu.identity_service.domain.exception.ValidationException;
import com.faceattend_edu.identity_service.domain.model.PasswordPolicy;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * The only place that decides whether a chosen password is acceptable. The policy row is read on
 * every call (one small query) so an edit by the Super Administrador applies immediately.
 */
@RequiredArgsConstructor
@Service
public class ValidatePasswordPolicyUseCaseImpl implements ValidatePasswordPolicyUseCase {

    private static final Logger log = LoggerFactory.getLogger(ValidatePasswordPolicyUseCaseImpl.class);

    /** AGENTS.md section 4.1 defaults, used when the table has no row or a rule column is null. */
    static final int DEFAULT_MIN_LENGTH = 8;
    static final int DEFAULT_MAX_LENGTH = 20;

    private final ListPasswordPoliciesPort listPasswordPoliciesPort;

    @Override
    public void validate(String password) {
        if (password == null || password.isBlank()) {
            throw new ValidationException("Password is required");
        }
        PasswordPolicy policy = listPasswordPoliciesPort.listPolicies().stream()
                .filter(p -> p != null)
                .findFirst()
                .orElse(null);
        if (policy == null) {
            log.warn("identity.password_policy has no row: validating with the default policy "
                    + "(8-20 characters, uppercase, number and symbol)");
        }

        int min = policy != null && policy.getMinLength() != null ? policy.getMinLength() : DEFAULT_MIN_LENGTH;
        int max = policy != null && policy.getMaxLength() != null ? policy.getMaxLength() : DEFAULT_MAX_LENGTH;
        if (password.length() < min || password.length() > max) {
            throw new ValidationException("Password must be between " + min + " and " + max + " characters");
        }
        if (flag(policy == null ? null : policy.getRequiresUppercase()) && !password.matches(".*[A-Z].*")) {
            throw new ValidationException("Password must contain an uppercase letter");
        }
        if (flag(policy == null ? null : policy.getRequiresNumbers()) && !password.matches(".*[0-9].*")) {
            throw new ValidationException("Password must contain a number");
        }
        if (flag(policy == null ? null : policy.getRequiresSymbols()) && !password.matches(".*[^A-Za-z0-9].*")) {
            throw new ValidationException("Password must contain a symbol");
        }
    }

    /** A missing policy or a null flag means the default, which requires the rule. */
    private static boolean flag(Boolean value) {
        return value == null || value;
    }
}
