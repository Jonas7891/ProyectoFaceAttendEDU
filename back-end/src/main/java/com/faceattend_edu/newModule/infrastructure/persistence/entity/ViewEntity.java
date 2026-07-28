package com.faceattend_edu.newModule.infrastructure.persistence.entity;

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
@Table(name = "view")
@NoArgsConstructor
@SuperBuilder
public class ViewEntity extends IntegerBaseEntity {

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "view_action",
        joinColumns = @JoinColumn(name = "id_view"),
        inverseJoinColumns = @JoinColumn(name = "id_action")
    )
    private List<ActionEntity> actions;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "route", nullable = false)
    private String route;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic;
}
