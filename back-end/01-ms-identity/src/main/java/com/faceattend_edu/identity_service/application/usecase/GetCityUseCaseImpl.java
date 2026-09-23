package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.GetCityUseCase;
import com.faceattend_edu.identity_service.application.port.out.LoadCityPort;
import com.faceattend_edu.identity_service.domain.model.City;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetCityUseCaseImpl implements GetCityUseCase {

    private final LoadCityPort loadCityPort;

    @Override
    public City getCity(Integer cityId) {
        return loadCityPort.loadCity(cityId);
    }
}
