package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.LogRequest;
import com.faceattend_edu.domain.dto.response.LogResponse;
import com.faceattend_edu.domain.model.Log;
import com.faceattend_edu.domain.model.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class LogServiceMapper {

    private final UserServiceMapper userServiceMapper;

    public Log toDomain(LogRequest request,
                        User user) {
        return new Log(
                null,
                user,
                request.action(),
                request.tableName(),
                request.affectedRecord(),
                request.description(),
                request.date()
        );
    }

    public LogResponse toResponse(Log log) {
        return new LogResponse(
                log.getId(),
                userServiceMapper.toResponse(log.getUser()),
                log.getAction(),
                log.getTableName(),
                log.getAffectedRecord(),
                log.getDescription(),
                log.getDate()
        );
    }
}
