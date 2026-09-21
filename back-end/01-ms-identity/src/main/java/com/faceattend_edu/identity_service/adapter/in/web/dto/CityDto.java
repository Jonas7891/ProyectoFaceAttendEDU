package com.faceattend_edu.identity_service.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CityDto {
    private Integer cityId;

    @NotBlank(message = "name is required")
    @Size(min = 1, max = 120, message = "name must be 1-120 characters")
    private String name;

    @Size(max = 120, message = "department must be <= 120 characters")
    private String department;
}
