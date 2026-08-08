package com.faceattend_edu.security.infrastructure.persistence.entity;

import com.faceattend_edu.util.infrastructure.entity.UUIDBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@Table(name = "school")
@NoArgsConstructor
@SuperBuilder
public class SchoolEntity extends UUIDBaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "nit", nullable = false, length = 50)
    private String nit;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "phone", length = 10)
    private String phone;

    @Column(name = "email")
    private String email;
}