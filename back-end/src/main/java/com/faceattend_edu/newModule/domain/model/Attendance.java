package com.faceattend_edu.newModule.domain.model;

import com.faceattend_edu.util.domain.model.LongBaseModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Attendance extends LongBaseModel {
    private Person student;
    private Schedule schedule;
    private IotDevice device;
    private LocalDate date;
    private LocalTime time;
}
