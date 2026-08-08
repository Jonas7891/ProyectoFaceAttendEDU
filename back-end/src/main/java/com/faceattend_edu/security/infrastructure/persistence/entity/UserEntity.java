package com.faceattend_edu.security.infrastructure.persistence.entity;

import com.faceattend_edu.util.infrastructure.entity.UUIDBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@Table(name = "users")
@NoArgsConstructor
@SuperBuilder
public class UserEntity extends UUIDBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_person", nullable = false)
    private PersonEntity person;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_role", nullable = false)
    private RoleEntity role;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;
}
