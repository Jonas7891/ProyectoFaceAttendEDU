package com.faceattend_edu.identity_service.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_sessions")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserSessionJpaEntity {
    @Id
    private UUID sessionId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserJpaEntity user;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String sourceIp;
    private String sessionStatus;
}
