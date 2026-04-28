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

    private User user;
    private Role role;
    private Instant assignedDate;
    private Instant expiryDate;

    public boolean isActive() {
        return expiryDate == null || expiryDate.isAfter(Instant.now());
    }
}