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
public class IotDevice {
    private Integer id;
    private Classroom classroom;
    private String deviceName;
    private String macAddress;
    private String ipAddress;
    private Object status;
    private Instant lastConnection;
    private String observation;
}