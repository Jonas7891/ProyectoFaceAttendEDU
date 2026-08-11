package com.faceattend_edu.security.infrastructure.persistence.entity;

import com.faceattend_edu.util.infrastructure.entity.IntegerBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "role")
@NoArgsConstructor
@SuperBuilder
public class RoleEntity extends IntegerBaseEntity {

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "role_module",
        joinColumns = @JoinColumn(name = "id_role"),
        inverseJoinColumns = @JoinColumn(name = "id_module")
    )
    private List<ModuleEntity> modules;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description")
    private String description;
}
