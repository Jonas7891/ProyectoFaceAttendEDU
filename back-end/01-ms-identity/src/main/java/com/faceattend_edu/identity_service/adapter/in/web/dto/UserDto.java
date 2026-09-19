package com.faceattend_edu.identity_service.adapter.in.web.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserDto {
    private UUID userId;
    private String username;
    private String authenticationType;
    private Boolean status;
}
