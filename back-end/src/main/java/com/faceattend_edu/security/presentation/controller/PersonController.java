package com.faceattend_edu.security.presentation.controller;

import com.faceattend_edu.security.application.service.PersonService;
import com.faceattend_edu.security.domain.dto.patch.PersonPatch;
import com.faceattend_edu.security.domain.dto.request.PersonRequest;
import com.faceattend_edu.security.domain.dto.response.PersonResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/persons")
public class PersonController extends AbstractController<PersonResponse, PersonRequest, PersonPatch, UUID> {

    private final PersonService service;

    @Override
    protected AbstractService<PersonRequest, PersonResponse, PersonPatch, UUID> getService() {
        return service;
    }
}
