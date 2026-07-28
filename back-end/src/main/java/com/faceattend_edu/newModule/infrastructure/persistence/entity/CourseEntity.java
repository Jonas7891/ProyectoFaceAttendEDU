package com.faceattend_edu.newModule.infrastructure.persistence.entity;

import com.faceattend_edu.util.infrastructure.entity.IntegerBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@Table(name = "course")
@NoArgsConstructor
@SuperBuilder
public class CourseEntity extends IntegerBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_school", nullable = false)
    private SchoolEntity school;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;
}
