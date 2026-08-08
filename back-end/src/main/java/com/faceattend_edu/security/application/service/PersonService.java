package com.faceattend_edu.security.application.service;

import com.faceattend_edu.security.domain.dto.patch.PersonPatch;
import com.faceattend_edu.security.domain.dto.request.PersonRequest;
import com.faceattend_edu.security.domain.dto.response.PersonResponse;
import com.faceattend_edu.util.application.AbstractService;

import java.util.UUID;

public interface PersonService
        extends AbstractService<PersonRequest, PersonResponse, PersonPatch, UUID> {
}
