package com.faceattend_edu.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Schedule {
    private Integer id;
    private Period idPeriod;
    private Course idCourse;
    private Person idTeacher;
    private Classroom idClassroom;
    private Object day;
    private LocalTime startTime;
    private LocalTime endTime;
}