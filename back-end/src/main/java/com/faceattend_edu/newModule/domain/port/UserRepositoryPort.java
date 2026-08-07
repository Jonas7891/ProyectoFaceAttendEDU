package com.faceattend_edu.newModule.domain.port;

import com.faceattend_edu.newModule.domain.model.User;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;

import java.util.UUID;

public interface UserRepositoryPort extends AbstractRepositoryPort<User, UUID> {
}
