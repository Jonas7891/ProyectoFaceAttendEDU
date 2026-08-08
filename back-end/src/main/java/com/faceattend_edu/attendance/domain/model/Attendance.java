package com.faceattend_edu.attendance.domain.model;

import com.faceattend_edu.iotDevice.domain.model.IotDevice;
import com.faceattend_edu.security.domain.model.Person;
import com.faceattend_edu.academic.domain.model.Schedule;
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
