package com.faceattend_edu.identity_service.adapter.out.persistence;

import com.faceattend_edu.identity_service.adapter.out.persistence.mapper.CityPersistenceMapper;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.CityJpaRepository;
import com.faceattend_edu.identity_service.application.port.out.DeleteCityPort;
import com.faceattend_edu.identity_service.application.port.out.ListCitiesPort;
import com.faceattend_edu.identity_service.application.port.out.LoadCityPort;
import com.faceattend_edu.identity_service.application.port.out.SaveCityPort;
import com.faceattend_edu.identity_service.application.port.out.UpdateCityPort;
import com.faceattend_edu.identity_service.domain.model.City;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CityPersistenceAdapter implements LoadCityPort, SaveCityPort, UpdateCityPort, DeleteCityPort, ListCitiesPort {

    private final CityJpaRepository repository;
    private final CityPersistenceMapper mapper;

    @Override
    public City loadCity(Integer cityId) {
        return mapper.toDomain(repository.findById(cityId).orElse(null));
    }

    @Override
    public List<City> listCities() {
        return repository.findAll().stream().map(mapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public City saveCity(City city) {
        return mapper.toDomain(repository.save(mapper.toEntity(city)));
    }

    @Override
    public void updateCity(City city) {
        repository.save(mapper.toEntity(city));
    }

    @Override
    public void deleteCity(Integer cityId) {
        repository.deleteById(cityId);
    }
}
