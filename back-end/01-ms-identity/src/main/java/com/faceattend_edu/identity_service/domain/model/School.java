package com.faceattend_edu.identity_service.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class School {
    private UUID schoolId;
    private String name;
    private String nit;
    private String address;
    private String district;
    private String phone;
    private String email;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void validate() {
        Objects.requireNonNull(this, "School must not be null");
        if (this.schoolId == null) throw new IllegalArgumentException("School.schoolId is required");
        if (isNullOrBlank(this.name)) throw new IllegalArgumentException("School.name is required");
        if (isNullOrBlank(this.nit)) throw new IllegalArgumentException("School.nit is required");
    }

    public boolean isActive() {
        return Boolean.TRUE.equals(this.status);
    }

    public void activate() {
        this.status = true;
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }

    public void deactivate() {
        this.status = false;
        this.updatedAt = LocalDateTime.now();
    }

    private static boolean isNullOrBlank(String str) {
        return str == null || str.trim().isEmpty();
    }
}
