package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.DeleteCityUseCase;
import com.faceattend_edu.identity_service.application.port.out.DeleteCityPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteCityUseCaseImpl implements DeleteCityUseCase {

    private final DeleteCityPort deleteCityPort;

    @Override
    public void deleteCity(Integer cityId) {
        deleteCityPort.deleteCity(cityId);
    }
}
