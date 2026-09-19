package com.faceattend_edu.identity_service.adapter.out.persistence;

import com.faceattend_edu.identity_service.adapter.out.persistence.mapper.SchoolPersistenceMapper;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.SchoolJpaRepository;
import com.faceattend_edu.identity_service.application.port.out.LoadSchoolPort;
import com.faceattend_edu.identity_service.application.port.out.SaveSchoolPort;
import com.faceattend_edu.identity_service.application.port.out.UpdateSchoolPort;
import com.faceattend_edu.identity_service.domain.model.School;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SchoolPersistenceAdapter implements LoadSchoolPort, SaveSchoolPort, UpdateSchoolPort {

    private final SchoolJpaRepository repository;
    private final SchoolPersistenceMapper mapper;

    @Override
    public School loadSchool(UUID schoolId) {
        return mapper.toDomain(repository.findById(schoolId).orElse(null));
    }

    @Override
    public School saveSchool(School school) {
        return mapper.toDomain(repository.save(mapper.toEntity(school)));
    }

    @Override
    public void updateSchool(School school) {
        repository.save(mapper.toEntity(school));
    }
}
