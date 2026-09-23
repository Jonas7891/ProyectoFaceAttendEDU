package com.faceattend_edu.identity_service.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Objects;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class City {
    private Integer cityId;
    private String name;
    private String department;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void validate() {
        Objects.requireNonNull(this, "City must not be null");
        if (isNullOrBlank(this.name)) throw new IllegalArgumentException("City.name is required");
    }

    private static boolean isNullOrBlank(String str) {
        return str == null || str.trim().isEmpty();
    }
}
