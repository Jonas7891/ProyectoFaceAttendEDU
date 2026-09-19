package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.UpdateSchoolUseCase;
import com.faceattend_edu.identity_service.application.port.out.UpdateSchoolPort;
import com.faceattend_edu.identity_service.domain.model.School;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@RequiredArgsConstructor
public class UpdateSchoolUseCaseImpl implements UpdateSchoolUseCase {

    private final UpdateSchoolPort updateSchoolPort;

    @Override
    public void updateSchool(School school) {
        school.validate();
        school.setUpdatedAt(LocalDateTime.now());
        updateSchoolPort.updateSchool(school);
    }
}
