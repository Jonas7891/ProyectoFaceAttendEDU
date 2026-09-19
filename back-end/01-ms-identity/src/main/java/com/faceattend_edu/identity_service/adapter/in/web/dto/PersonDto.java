package com.faceattend_edu.identity_service.adapter.in.web.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class PersonDto {
    private UUID personId;
    private String name;
    private String lastName;
    private String email;
}
