package com.faceattend_edu.identity_service.application.port.out;

import com.faceattend_edu.identity_service.domain.model.User;

import java.util.List;

public interface ListUsersPort {

    List<User> listUsers();
}
