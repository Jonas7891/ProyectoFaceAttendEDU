package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.CityDto;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.CityWebMapper;
import com.faceattend_edu.identity_service.application.port.in.CreateCityUseCase;
import com.faceattend_edu.identity_service.application.port.in.DeleteCityUseCase;
import com.faceattend_edu.identity_service.application.port.in.GetCityUseCase;
import com.faceattend_edu.identity_service.application.port.in.ListCitiesUseCase;
import com.faceattend_edu.identity_service.application.port.in.UpdateCityUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

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
    public ResponseEntity<CityDto> createCity(@Valid @RequestBody CityDto cityDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cityWebMapper.toDto(createCityUseCase.createCity(cityWebMapper.toDomain(cityDto))));
    }

    @GetMapping
    public ResponseEntity<List<CityDto>> listCities(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        int safeOffset = Math.max(offset, 0);
        List<CityDto> all = listCitiesUseCase.listCities().stream()
                .map(cityWebMapper::toDto)
                .collect(Collectors.toList());
        int from = Math.min(safeOffset, all.size());
        int to = Math.min(from + safeLimit, all.size());
        return ResponseEntity.ok(all.subList(from, to));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CityDto> getCity(@PathVariable Integer id) {
        return ResponseEntity.ok(cityWebMapper.toDto(getCityUseCase.getCity(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateCity(@PathVariable Integer id, @Valid @RequestBody CityDto cityDto) {
        cityDto.setCityId(id);
        updateCityUseCase.updateCity(cityWebMapper.toDomain(cityDto));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCity(@PathVariable Integer id) {
        deleteCityUseCase.deleteCity(id);
        return ResponseEntity.noContent().build();
    }
}
