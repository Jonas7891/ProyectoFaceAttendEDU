package com.faceattend_edu.academic.domain.model;

import com.faceattend_edu.security.domain.model.Person;
import com.faceattend_edu.util.domain.model.LongBaseModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment extends LongBaseModel {
    private Person student;
    private Course course;
    private Period period;
    private LocalDateTime date;
}
