package com.faceattend_edu.identity_service.application.port.in;

import com.faceattend_edu.identity_service.domain.model.User;

public interface GetUserByUsernameUseCase {

    User getUserByUsername(String username);
}
