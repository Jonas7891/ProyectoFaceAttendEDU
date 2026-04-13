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
public class UserRole {
    private Integer id;
    private User idUser;
    private Role idRole;
    private Instant assignedDate;
    private Instant expiryDate;
}