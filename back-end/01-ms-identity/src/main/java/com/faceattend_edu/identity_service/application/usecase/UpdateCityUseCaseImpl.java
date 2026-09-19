package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.UpdateCityUseCase;
import com.faceattend_edu.identity_service.application.port.out.UpdateCityPort;
import com.faceattend_edu.identity_service.domain.model.City;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UpdateCityUseCaseImpl implements UpdateCityUseCase {

    private final UpdateCityPort updateCityPort;

    @Override
    public void updateCity(City city) {
        city.validate();
        city.setUpdatedAt(LocalDateTime.now());
        updateCityPort.updateCity(city);
    }
}
