package com.faceattend_edu.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "user_role")
public class UserRoleEntity {
    @EmbeddedId
    private UserRoleEntityId id = new UserRoleEntityId();

    @MapsId("user")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_user", nullable = false)
    private UserEntity user;

    @MapsId("role")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_role", nullable = false)
    private RoleEntity role;

    @ColumnDefault("now()")
    @Column(name = "assigned_date", nullable = false)
    private Instant assignedDate;

    @Column(name = "expiry_date")
    private Instant expiryDate;

    @PrePersist
    public void prePersist() {
        if (assignedDate == null) {
            assignedDate = Instant.now();
        }
    }
}