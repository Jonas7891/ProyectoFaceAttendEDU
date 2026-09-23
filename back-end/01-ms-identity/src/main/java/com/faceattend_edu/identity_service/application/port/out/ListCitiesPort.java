package com.faceattend_edu.identity_service.application.port.out;

import com.faceattend_edu.identity_service.domain.model.City;
import java.util.List;

public interface ListCitiesPort {
    List<City> listCities();
}
