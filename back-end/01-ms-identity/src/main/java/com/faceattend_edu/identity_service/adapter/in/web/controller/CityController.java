package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.CityDto;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.CityWebMapper;
import com.faceattend_edu.identity_service.application.port.in.CreateCityUseCase;
import com.faceattend_edu.identity_service.application.port.in.DeleteCityUseCase;
import com.faceattend_edu.identity_service.application.port.in.GetCityUseCase;
import com.faceattend_edu.identity_service.application.port.in.ListCitiesUseCase;
import com.faceattend_edu.identity_service.application.port.in.UpdateCityUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/cities")
@RequiredArgsConstructor
public class CityController {

    private final CreateCityUseCase createCityUseCase;
    private final GetCityUseCase getCityUseCase;
    private final ListCitiesUseCase listCitiesUseCase;
    private final UpdateCityUseCase updateCityUseCase;
    private final DeleteCityUseCase deleteCityUseCase;
    private final CityWebMapper cityWebMapper;

    @PostMapping
    public ResponseEntity<CityDto> createCity(@RequestBody CityDto cityDto) {
        return ResponseEntity.ok(cityWebMapper.toDto(createCityUseCase.createCity(cityWebMapper.toDomain(cityDto))));
    }

    @GetMapping
    public ResponseEntity<List<CityDto>> listCities() {
        return ResponseEntity.ok(listCitiesUseCase.listCities().stream()
                .map(cityWebMapper::toDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CityDto> getCity(@PathVariable Integer id) {
        return ResponseEntity.ok(cityWebMapper.toDto(getCityUseCase.getCity(id)));
    }

    @PutMapping
    public ResponseEntity<Void> updateCity(@RequestBody CityDto cityDto) {
        updateCityUseCase.updateCity(cityWebMapper.toDomain(cityDto));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCity(@PathVariable Integer id) {
        deleteCityUseCase.deleteCity(id);
        return ResponseEntity.noContent().build();
    }
}
