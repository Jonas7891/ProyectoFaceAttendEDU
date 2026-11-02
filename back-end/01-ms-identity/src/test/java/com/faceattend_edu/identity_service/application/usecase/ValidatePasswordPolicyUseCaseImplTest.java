package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.out.ListPasswordPoliciesPort;
import com.faceattend_edu.identity_service.domain.exception.ValidationException;
import com.faceattend_edu.identity_service.domain.model.PasswordPolicy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** The single server-side authority for password rules (AUD-20, AUD-70): identity.password_policy. */
@DisplayName("ValidatePasswordPolicyUseCaseImpl unit tests")
class ValidatePasswordPolicyUseCaseImplTest {

    private static PasswordPolicy policy(int min, int max, boolean upper, boolean numbers, boolean symbols) {
        PasswordPolicy policy = new PasswordPolicy();
        policy.setPolicyId(1);
        policy.setMinLength(min);
        policy.setMaxLength(max);
        policy.setRequiresUppercase(upper);
        policy.setRequiresNumbers(numbers);
        policy.setRequiresSymbols(symbols);
        policy.setExpirationDays(90);
        return policy;
    }

    private static ValidatePasswordPolicyUseCaseImpl validator(PasswordPolicy... policies) {
        ListPasswordPoliciesPort port = () -> List.of(policies);
        return new ValidatePasswordPolicyUseCaseImpl(port);
    }

    private final ValidatePasswordPolicyUseCaseImpl seeded = validator(policy(8, 20, true, true, true));

    @Test
    @DisplayName("accepts a password that meets every rule of the seeded policy")
    void acceptsCompliantPassword() {
        assertThatCode(() -> seeded.validate("Secret1!")).doesNotThrowAnyException();
    }

    @ParameterizedTest
    @ValueSource(strings = {"abcdefgh", "Secret1", "secret1!x", "SECRET!!x", "Secret!!x", "Abcdefg1", "Aa1!aaaaaaaaaaaaaaaaaaaaa"})
    @DisplayName("rejects, with a 400-mapped ValidationException, passwords that break a rule")
    void rejectsNonCompliantPassword(String candidate) {
        assertThatThrownBy(() -> seeded.validate(candidate))
                .isInstanceOf(ValidationException.class)
                .satisfies(ex -> assertThat(ex.getMessage()).doesNotContain(candidate));
    }

    @Test
    @DisplayName("reports a stable message per violated rule")
    void stableMessages() {
        assertThatThrownBy(() -> seeded.validate("Aa1!")).hasMessage("Password must be between 8 and 20 characters");
        assertThatThrownBy(() -> seeded.validate("secret1!")).hasMessage("Password must contain an uppercase letter");
        assertThatThrownBy(() -> seeded.validate("Secret!!")).hasMessage("Password must contain a number");
        assertThatThrownBy(() -> seeded.validate("Secret11")).hasMessage("Password must contain a symbol");
    }

    @Test
    @DisplayName("rejects a null or blank password")
    void rejectsBlank() {
        assertThatThrownBy(() -> seeded.validate(null)).isInstanceOf(ValidationException.class);
        assertThatThrownBy(() -> seeded.validate("   ")).isInstanceOf(ValidationException.class);
    }

    @Test
    @DisplayName("follows the policy in force, not a hard-coded one")
    void followsThePolicyInForce() {
        ValidatePasswordPolicyUseCaseImpl relaxed = validator(policy(4, 10, false, false, false));

        assertThatCode(() -> relaxed.validate("abcd")).doesNotThrowAnyException();
        assertThatThrownBy(() -> relaxed.validate("abc")).isInstanceOf(ValidationException.class);
        assertThatThrownBy(() -> relaxed.validate("abcdefghijk")).isInstanceOf(ValidationException.class);
    }

    @Test
    @DisplayName("falls back to the AGENTS.md section 4.1 defaults when the policy table is empty")
    void fallsBackToDefaultsWhenNoPolicy() {
        ValidatePasswordPolicyUseCaseImpl empty = validator();

        assertThatCode(() -> empty.validate("Secret1!")).doesNotThrowAnyException();
        assertThatThrownBy(() -> empty.validate("abcdefgh")).isInstanceOf(ValidationException.class);
        assertThatThrownBy(() -> empty.validate("Secret1!Secret1!Secret1!")).isInstanceOf(ValidationException.class);
    }
}
