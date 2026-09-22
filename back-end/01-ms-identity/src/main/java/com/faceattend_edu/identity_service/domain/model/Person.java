package com.faceattend_edu.identity_service.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Person {
    private UUID personId;
    private School schoolId;
    private String name;
    private String lastName;
    private String email;
    private String phone;
    private BloodType rh;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    public void validate() {
        Objects.requireNonNull(this, "Person must not be null");
        if (isNullOrBlank(this.name)) throw new IllegalArgumentException("Person.name is required");
        if (isNullOrBlank(this.lastName)) throw new IllegalArgumentException("Person.lastName is required");
        if (this.email != null && !EMAIL_PATTERN.matcher(this.email).matches()) {
            throw new IllegalArgumentException("Person.email is not a valid email");
        }
    }

    public String getFullName() {
        String n = this.name == null ? "" : this.name.trim();
        String ln = this.lastName == null ? "" : this.lastName.trim();
        return (n + " " + ln).trim();
    }

    public boolean isActive() {
        return Boolean.TRUE.equals(this.status);
    }

    public void touchCreatedIfMissing() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }

    private static boolean isNullOrBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
