package com.faceattend_edu.identity_service.adapter.in.web.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}
