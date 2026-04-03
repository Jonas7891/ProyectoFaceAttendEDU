package com.faceattend_edu.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "role_module")
public class RoleModuleEntity {
    @EmbeddedId
    private RoleModuleEntityId id;

    @MapsId("idRole")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_role", nullable = false)
    private RoleEntity idRole;

    @MapsId("idModule")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_module", nullable = false)
    private ModuleEntity idModule;


}