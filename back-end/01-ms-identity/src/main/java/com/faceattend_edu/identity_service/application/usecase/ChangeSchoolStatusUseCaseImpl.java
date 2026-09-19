package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.ChangeSchoolStatusUseCase;
import com.faceattend_edu.identity_service.application.port.out.LoadSchoolPort;
import com.faceattend_edu.identity_service.application.port.out.UpdateSchoolPort;
import com.faceattend_edu.identity_service.domain.model.School;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class ChangeSchoolStatusUseCaseImpl implements ChangeSchoolStatusUseCase {

    private final LoadSchoolPort loadSchoolPort;
    private final UpdateSchoolPort updateSchoolPort;

    @Override
    public void changeStatus(UUID schoolId, boolean status) {
        School school = loadSchoolPort.loadSchool(schoolId);
        if (status) {
            school.activate();
        } else {
            school.deactivate();
        }
        school.setUpdatedAt(LocalDateTime.now());
        updateSchoolPort.updateSchool(school);
    }
}
