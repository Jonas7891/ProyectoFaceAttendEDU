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
public class School {
    private Integer id;
    private String name;
    private String nit;
    private String address;
    private String phone;
    private String email;
    private Boolean status;
    private Instant createdAt;
    private Instant updatedAt;
}