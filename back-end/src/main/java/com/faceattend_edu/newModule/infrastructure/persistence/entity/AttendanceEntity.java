package com.faceattend_edu.newModule.infrastructure.persistence.entity;

import com.faceattend_edu.util.infrastructure.entity.LongBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "attendance")
@NoArgsConstructor
@SuperBuilder
public class AttendanceEntity extends LongBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_student", nullable = false)
    private PersonEntity student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_schedule", nullable = false)
    private ScheduleEntity schedule;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_device", nullable = false)
    private IotDeviceEntity device;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "time")
    private LocalTime time;
}
