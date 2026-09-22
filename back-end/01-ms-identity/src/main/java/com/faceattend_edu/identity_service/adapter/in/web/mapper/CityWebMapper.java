package com.faceattend_edu.identity_service.adapter.in.web.mapper;

import com.faceattend_edu.identity_service.adapter.in.web.dto.CityDto;
import com.faceattend_edu.identity_service.domain.model.City;
import org.springframework.stereotype.Component;

@Component
public class CityWebMapper {

    public CityDto toDto(City domain) {
        if (domain == null) return null;
        CityDto dto = new CityDto();
        dto.setCityId(domain.getCityId());
        dto.setName(domain.getName());
        dto.setDepartment(domain.getDepartment());
        return dto;
    }

    public City toDomain(CityDto dto) {
        if (dto == null) return null;
        City city = new City();
        city.setCityId(dto.getCityId());
        city.setName(dto.getName());
        city.setDepartment(dto.getDepartment());
        return city;
    }
}
