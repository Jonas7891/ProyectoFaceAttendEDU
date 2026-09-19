package com.faceattend_edu.identity_service.application.port.in;

import com.faceattend_edu.identity_service.domain.model.City;
import java.util.List;

public interface ListCitiesUseCase {
    List<City> listCities();
}
