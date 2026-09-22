package com.faceattend_edu.identity_service.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_policy", schema = "identity")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PasswordPolicyJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer policyId;

    private Integer minLength;
    private Integer maxLength;
    private Boolean requiresUppercase;
    private Boolean requiresNumbers;
    private Boolean requiresSymbols;
    private Integer expirationDays;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
