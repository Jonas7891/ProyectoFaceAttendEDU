package com.faceattend_edu.identity_service.adapter.in.web.mapper;

import com.faceattend_edu.identity_service.adapter.in.web.dto.UserSessionDto;
import com.faceattend_edu.identity_service.domain.model.UserSession;
import org.springframework.stereotype.Component;

@Component
public class UserSessionWebMapper {

    public UserSessionDto toDto(UserSession domain) {
        if (domain == null) return null;
        UserSessionDto dto = new UserSessionDto();
        dto.setSessionId(domain.getSessionId());
        dto.setUserId(domain.getUserId().getUserId());
        dto.setSessionStatus(domain.getSessionStatus());
        return dto;
    }
}
