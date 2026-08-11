package com.faceattend_edu.security.application.service;

import com.faceattend_edu.security.domain.dto.patch.UserPatch;
import com.faceattend_edu.security.domain.dto.request.UserRequest;
import com.faceattend_edu.security.domain.dto.response.UserResponse;
import com.faceattend_edu.util.application.AbstractService;

import java.util.UUID;

public interface UserService
        extends AbstractService<UserRequest, UserResponse, UserPatch, UUID> {
}
