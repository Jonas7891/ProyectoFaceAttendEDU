package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.ListCitiesUseCase;
import com.faceattend_edu.identity_service.application.port.out.ListCitiesPort;
import com.faceattend_edu.identity_service.domain.model.City;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListCitiesUseCaseImpl implements ListCitiesUseCase {

    private final ListCitiesPort listCitiesPort;

    @Override
    public List<City> listCities() {
        return listCitiesPort.listCities();
    }
}
