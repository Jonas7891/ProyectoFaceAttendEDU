package com.faceattend_edu.iotDevice.domain.model;

import com.faceattend_edu.academic.domain.model.Classroom;
import com.faceattend_edu.util.domain.model.UUIDBaseModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IotDevice extends UUIDBaseModel {
    private Classroom classroom;
    private String name;
    private String macAddress;
    private String ipAddress;
    // private DeviceStatus status; Sobreescritura (Override)
    private LocalDateTime lastConnection;
    private String observation;
}
