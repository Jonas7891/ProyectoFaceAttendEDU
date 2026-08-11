package com.faceattend_edu.academic.domain.model;

import com.faceattend_edu.security.domain.model.Person;
import com.faceattend_edu.util.domain.model.LongBaseModel;
import com.faceattend_edu.util.enums.Days;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Schedule extends LongBaseModel {
    private Period period;
    private Course course;
    private Person teacher;
    private Classroom classroom;
    private Days day;
    private LocalTime startTime;
    private LocalTime endTime;
}
