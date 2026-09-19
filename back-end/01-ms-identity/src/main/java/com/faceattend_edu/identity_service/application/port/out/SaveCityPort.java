package com.faceattend_edu.identity_service.application.port.out;

import com.faceattend_edu.identity_service.domain.model.City;

public interface SaveCityPort {
    City saveCity(City city);
}
