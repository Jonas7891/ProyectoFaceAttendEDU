package com.faceattend_edu.identity_service.adapter.in.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PersonDto {
    private UUID personId;

    @NotBlank
    @Size(max = 50)
    private String documentNumber;

    @NotBlank
    private String name;

    @NotBlank
    private String lastName;

    @Email
    private String email;

    @Size(max = 50)
    private String phone;

    @Size(max = 10)
    private String documentType;

    @Size(max = 5)
    private String bloodType;

    private LocalDate birthDate;

    private String address;

    private Boolean status;
}
