package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.CreateSchoolUseCase;
import com.faceattend_edu.identity_service.application.port.out.SaveSchoolPort;
import com.faceattend_edu.identity_service.domain.model.School;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Service
public class CreateSchoolUseCaseImpl implements CreateSchoolUseCase {

    private final SaveSchoolPort saveSchoolPort;

    @Override
    public School createSchool(School school) {
        school.validate();
        school.activate();
        school.setCreatedAt(LocalDateTime.now());
        return saveSchoolPort.saveSchool(school);
    }
}
