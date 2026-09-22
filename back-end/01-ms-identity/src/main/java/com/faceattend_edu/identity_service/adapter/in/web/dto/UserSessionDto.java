package com.faceattend_edu.identity_service.adapter.in.web.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserSessionDto {
    private UUID sessionId;
    private UUID userId;
    private String sessionStatus;
}
