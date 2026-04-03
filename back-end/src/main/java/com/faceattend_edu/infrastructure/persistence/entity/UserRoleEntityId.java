package com.faceattend_edu.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@EqualsAndHashCode
@Embeddable
public class UserRoleEntityId implements Serializable {
    private static final long serialVersionUID = -2465848025649666670L;
    @Column(name = "id_user", nullable = false)
    private Integer idUser;

    @Column(name = "id_role", nullable = false)
    private Integer idRole;


}