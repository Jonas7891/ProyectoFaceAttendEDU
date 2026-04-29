package com.faceattend_edu.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "module")
public class ModuleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_module", nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

    @Column(name = "icon", length = 100)
    private String icon;

    @Column(name = "\"order\"", nullable = false)
    private Integer order;

    //

    @ManyToMany(mappedBy = "modules")
    private Set<RoleEntity> roles = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "view_module",
            joinColumns = @JoinColumn(name = "id_module"),
            inverseJoinColumns = @JoinColumn(name = "id_view")
    )
    private Set<ViewEntity> views = new HashSet<>();

}