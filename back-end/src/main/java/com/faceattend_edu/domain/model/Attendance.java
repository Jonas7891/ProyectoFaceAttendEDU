package com.faceattend_edu.domain.model;

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
public class Attendance {
    private Integer id;
    private Person student;
    private Schedule schedule;
    private IotDevice iotDevice;
    private LocalDate date;
    private LocalTime time;
    private Object status;
}