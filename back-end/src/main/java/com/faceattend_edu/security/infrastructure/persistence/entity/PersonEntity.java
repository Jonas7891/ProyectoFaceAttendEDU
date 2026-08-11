package com.faceattend_edu.security.infrastructure.persistence.entity;

import com.faceattend_edu.util.infrastructure.entity.UUIDBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@Table(name = "person")
@NoArgsConstructor
@SuperBuilder
public class PersonEntity extends UUIDBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_school", nullable = false)
    private SchoolEntity school;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "is_student", nullable = false)
    private boolean isStudent;

    @Column(name = "is_teacher", nullable = false)
    private boolean isTeacher;
}
