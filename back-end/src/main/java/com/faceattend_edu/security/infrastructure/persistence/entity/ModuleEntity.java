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
@Table(name = "module")
@NoArgsConstructor
@SuperBuilder
public class ModuleEntity extends IntegerBaseEntity {

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "module_view",
        joinColumns = @JoinColumn(name = "id_module"),
        inverseJoinColumns = @JoinColumn(name = "id_view")
    )
    private List<ViewEntity> views;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "icon")
    private String icon;

    @Column(name = "orderr")
    private Integer order;
}
