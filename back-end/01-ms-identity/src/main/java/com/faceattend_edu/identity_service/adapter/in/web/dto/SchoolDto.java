package com.faceattend_edu.identity_service.adapter.in.web.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class SchoolDto {
    private UUID schoolId;
    private String name;
    private String nit;
    private String address;
    private Boolean status;
}
