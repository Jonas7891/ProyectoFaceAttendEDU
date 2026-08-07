package com.faceattend_edu.newModule.domain.port;

import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;

import java.util.UUID;

public interface PersonRepositoryPort extends AbstractRepositoryPort<Person, UUID> {
}
