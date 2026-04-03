package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.PersonRequest;
import com.faceattend_edu.domain.dto.response.PersonResponse;

import java.util.List;

public interface PersonService {

    PersonResponse findById(Integer id);

    List<PersonResponse> findAll();

    PersonResponse save(PersonRequest request);

    PersonResponse update(Integer id, PersonRequest request);

    void deleteById(Integer id);
}
