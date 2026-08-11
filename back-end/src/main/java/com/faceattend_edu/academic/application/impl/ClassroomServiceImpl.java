package com.faceattend_edu.academic.application.impl;

import com.faceattend_edu.academic.application.mapper.ClassroomServiceMapper;
import com.faceattend_edu.academic.application.service.ClassroomService;
import com.faceattend_edu.academic.domain.dto.patch.ClassroomPatch;
import com.faceattend_edu.academic.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.academic.domain.dto.response.ClassroomResponse;
import com.faceattend_edu.academic.domain.model.Classroom;
import com.faceattend_edu.academic.domain.port.ClassroomRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class ClassroomServiceImpl
        extends AbstractServiceImpl<Classroom, ClassroomResponse, ClassroomRequest, ClassroomPatch, Integer>
        implements ClassroomService {

    private final ClassroomRepositoryPort repository;
    private final ClassroomServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Classroom, Integer> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Classroom";
    }

    @Override
    protected Function<ClassroomRequest, Classroom> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Classroom, ClassroomResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Classroom, ClassroomRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Classroom, ClassroomPatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Classroom, Boolean> setStatus() {
        return Classroom::setStatus;
    }
}
