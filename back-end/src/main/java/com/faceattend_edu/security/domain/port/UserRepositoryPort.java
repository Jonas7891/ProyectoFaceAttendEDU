package com.faceattend_edu.security.domain.port;

import com.faceattend_edu.security.domain.model.User;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;

import java.util.UUID;

public interface UserRepositoryPort extends AbstractRepositoryPort<User, UUID> {
}
