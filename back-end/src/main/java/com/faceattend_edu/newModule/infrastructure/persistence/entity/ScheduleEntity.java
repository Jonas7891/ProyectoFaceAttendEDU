package com.faceattend_edu.newModule.infrastructure.persistence.entity;

import com.faceattend_edu.util.enums.Days;
import com.faceattend_edu.util.infrastructure.entity.LongBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "schedule")
@NoArgsConstructor
@SuperBuilder
public class ScheduleEntity extends LongBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_period", nullable = false)
    private PeriodEntity period;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_course", nullable = false)
    private CourseEntity course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_teacher", nullable = false)
    private PersonEntity teacher;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_classroom", nullable = false)
    private ClassroomEntity classroom;

    @Enumerated(EnumType.STRING)
    @Column(name = "day", nullable = false)
    private Days day;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
}
