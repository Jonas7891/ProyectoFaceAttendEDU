package com.faceattend_edu.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "enrollment")
public class EnrollmentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_enrollment", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_student", nullable = false)
    private PersonEntity idStudent;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_course", nullable = false)
    private CourseEntity idCourse;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_period", nullable = false)
    private PeriodEntity idPeriod;

    @ColumnDefault("now()")
    @Column(name = "enrollment_date", nullable = false)
    private Instant enrollmentDate;

    @ColumnDefault("'Active'")
    @Column(name = "status", columnDefinition = "enrollment_status_enum not null")
    private Object status;


}