package com.faceattend_edu.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "iot_device")
public class IotDeviceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_device", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_classroom", nullable = false)
    private ClassroomEntity idClassroom;

    @Column(name = "device_name", nullable = false)
    private String deviceName;

    @Column(name = "mac_address", length = 17)
    private String macAddress;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @ColumnDefault("'Active'")
    @Column(name = "status", columnDefinition = "device_status_enum not null")
    private Object status;

    @Column(name = "last_connection")
    private Instant lastConnection;

    @Column(name = "observation", length = Integer.MAX_VALUE)
    private String observation;


}