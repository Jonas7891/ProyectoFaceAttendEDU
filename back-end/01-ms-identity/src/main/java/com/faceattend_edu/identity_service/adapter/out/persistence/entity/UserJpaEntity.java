package com.faceattend_edu.identity_service.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserJpaEntity {
    @Id
    private UUID userId;
    
    @ManyToOne
    @JoinColumn(name = "person_id")
    private PersonJpaEntity person;
    
    private String username;
    private String passwordHash;
    private String authenticationType;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastAccess;
}
