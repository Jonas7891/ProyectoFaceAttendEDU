package com.faceattend_edu.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
@EqualsAndHashCode
public class UserRoleEntityId implements Serializable {
    @Column(name = "id_user", nullable = false)
    private Integer user;

    @Column(name = "id_role", nullable = false)
    private Integer role;
}