package com.faceattend_edu.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {
    private Integer id;
    private Person idStudent;
    private Course idCourse;
    private Period idPeriod;
    private Instant enrollmentDate;
    private Object status;
}