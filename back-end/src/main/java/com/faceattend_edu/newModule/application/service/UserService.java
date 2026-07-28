package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.UserPatch;
import com.faceattend_edu.newModule.domain.dto.request.UserRequest;
import com.faceattend_edu.newModule.domain.dto.response.UserResponse;
import com.faceattend_edu.util.application.AbstractService;

import java.util.UUID;

public interface UserService
        extends AbstractService<UserRequest, UserResponse, UserPatch, UUID> {
}
