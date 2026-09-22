package com.faceattend_edu.identity_service.application.port.in;

import com.faceattend_edu.identity_service.domain.model.City;

public interface GetCityUseCase {
    City getCity(Integer cityId);
}
