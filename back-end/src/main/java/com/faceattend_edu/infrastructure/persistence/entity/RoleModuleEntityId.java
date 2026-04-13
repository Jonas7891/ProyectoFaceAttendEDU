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
public class RoleModuleEntityId implements Serializable {
    private static final long serialVersionUID = 8018336566898065656L;
    @Column(name = "id_role", nullable = false)
    private Integer idRole;

    @Column(name = "id_module", nullable = false)
    private Integer idModule;


}