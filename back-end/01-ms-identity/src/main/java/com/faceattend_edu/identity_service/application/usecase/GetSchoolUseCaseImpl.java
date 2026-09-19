package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.GetSchoolUseCase;
import com.faceattend_edu.identity_service.application.port.out.LoadSchoolPort;
import com.faceattend_edu.identity_service.domain.model.School;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
public class GetSchoolUseCaseImpl implements GetSchoolUseCase {

    private final LoadSchoolPort loadSchoolPort;

    @Override
    public School getSchool(UUID schoolId) {
        return loadSchoolPort.loadSchool(schoolId);
    }
}
