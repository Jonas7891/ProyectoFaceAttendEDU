package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.LogRequest;
import com.faceattend_edu.domain.dto.response.LogResponse;
import com.faceattend_edu.domain.model.Log;
import org.springframework.stereotype.Component;

@Component
public class LogMapper {

    public Log toDomain(LogRequest request) {
        return new Log(
                null,
                request.idUser(),
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
                log.getIdUser(),
                log.getAction(),
                log.getTableName(),
                log.getAffectedRecord(),
                log.getDescription(),
                log.getDate()
        );
    }
}
