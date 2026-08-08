package com.faceattend_edu.academic.infrastructure.persistence.entity;

import com.faceattend_edu.security.infrastructure.persistence.entity.SchoolEntity;
import com.faceattend_edu.util.infrastructure.entity.IntegerBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@Table(name = "classroom")
@NoArgsConstructor
@SuperBuilder
public class ClassroomEntity extends IntegerBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_school", nullable = false)
    private SchoolEntity school;

    @Column(name = "name", nullable = false)
    private String name;
}
