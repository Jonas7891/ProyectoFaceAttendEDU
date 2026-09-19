package com.faceattend_edu.identity_service.adapter.in.web.mapper;

import com.faceattend_edu.identity_service.adapter.in.web.dto.UserDto;
import com.faceattend_edu.identity_service.domain.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserWebMapper {

    public UserDto toDto(User domain) {
        if (domain == null) return null;
        UserDto dto = new UserDto();
        dto.setUserId(domain.getUserId());
        dto.setUsername(domain.getUsername());
        dto.setAuthenticationType(domain.getAuthenticationType());
        dto.setStatus(domain.getStatus());
        return dto;
    }

    public User toDomain(UserDto dto) {
        if (dto == null) return null;
        User user = new User();
        user.setUserId(dto.getUserId());
        user.setUsername(dto.getUsername());
        user.setAuthenticationType(dto.getAuthenticationType());
        user.setStatus(dto.getStatus());
        return user;
    }
}
