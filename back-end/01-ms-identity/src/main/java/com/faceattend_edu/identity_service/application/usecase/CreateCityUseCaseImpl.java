package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.CreateCityUseCase;
import com.faceattend_edu.identity_service.application.port.out.SaveCityPort;
import com.faceattend_edu.identity_service.domain.model.City;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CreateCityUseCaseImpl implements CreateCityUseCase {

    private final SaveCityPort saveCityPort;

    @Override
    public City createCity(City city) {
        city.validate();
        city.setCreatedAt(LocalDateTime.now());
        return saveCityPort.saveCity(city);
    }
}
