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
    private Person student;
    private Course course;
    private Period period;
    private Instant enrollmentDate;
    private Object status;
}