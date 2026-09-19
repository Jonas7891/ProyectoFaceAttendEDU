package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.in.CreateCityUseCase;
import com.faceattend_edu.identity_service.application.port.out.SaveCityPort;
import com.faceattend_edu.identity_service.adapter.out.messaging.DomainEventPublisher;
import com.faceattend_edu.identity_service.domain.model.City;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CreateCityUseCaseImpl implements CreateCityUseCase {

    private final SaveCityPort saveCityPort;
    private final DomainEventPublisher eventPublisher;

    @Override
    public City createCity(City city) {
        city.validate();
        city.setCreatedAt(LocalDateTime.now());
        City saved = saveCityPort.saveCity(city);
        eventPublisher.publish("city-events", "{\"cityId\":" + saved.getCityId() + ",\"name\":\"" + saved.getName() + "\"}");
        return saved;
    }
}
