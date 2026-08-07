package com.faceattend_edu.newModule.infrastructure.persistence.entity;

import com.faceattend_edu.util.infrastructure.entity.IntegerBaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@Table(name = "action")
@NoArgsConstructor
@SuperBuilder
public class ActionEntity extends IntegerBaseEntity {

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "http_method", nullable = false)
    private String httpMethod;
}
