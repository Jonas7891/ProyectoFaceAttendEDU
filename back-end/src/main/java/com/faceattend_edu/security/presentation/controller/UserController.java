package com.faceattend_edu.security.presentation.controller;

import com.faceattend_edu.security.application.service.UserService;
import com.faceattend_edu.security.domain.dto.patch.UserPatch;
import com.faceattend_edu.security.domain.dto.request.UserRequest;
import com.faceattend_edu.security.domain.dto.response.UserResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController extends AbstractController<UserResponse, UserRequest, UserPatch, UUID> {

    private final UserService service;

    @Override
    protected AbstractService<UserRequest, UserResponse, UserPatch, UUID> getService() {
        return service;
    }
}
