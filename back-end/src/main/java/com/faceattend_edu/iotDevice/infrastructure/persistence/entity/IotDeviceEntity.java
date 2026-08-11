package com.faceattend_edu.iotDevice.infrastructure.persistence.entity;

import com.faceattend_edu.academic.infrastructure.persistence.entity.ClassroomEntity;
import com.faceattend_edu.util.infrastructure.entity.UUIDBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "iotDevice")
@NoArgsConstructor
@SuperBuilder
public class IotDeviceEntity extends UUIDBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_classroom", nullable = false)
    private ClassroomEntity classroom;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "mac_address", nullable = false)
    private String macAddress;

    @Column(name = "ip_address", nullable = false)
    private String ipAddress;

    //private DeviceStatusEntity status; // Sobreescritura (Override)

    @Column(name = "last_connection")
    private LocalDateTime lastConnection;

    @Column(name = "observation")
    private String observation;
}
