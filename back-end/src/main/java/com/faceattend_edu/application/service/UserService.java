package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.UserRequest;
import com.faceattend_edu.domain.dto.response.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse findById(Integer id);

    List<UserResponse> findAll();

    UserResponse save(UserRequest request);

    UserResponse update(Integer id, UserRequest request);

    void deleteById(Integer id);
}
