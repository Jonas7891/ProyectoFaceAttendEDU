package com.faceattend_edu.identity_service.application.port.in;

import com.faceattend_edu.identity_service.domain.model.User;

import java.util.List;

public interface ListUsersUseCase {

    List<User> listUsers();
}
