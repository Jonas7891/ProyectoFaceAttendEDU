package com.faceattend_edu.authorization_service.domain.model;

import java.time.Instant;
import java.util.UUID;

public class Role {
    private Integer roleId;
    private String roleName;
    private String description;
    private Instant createdAt;
    // audit fields
    private UUID createdBy;
    private long rowVersion;
    // getters/setters omitted for scaffold
}
