package com.faceattend_edu.scheduling_service.infrastructure.web.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateClassSessionRequest {
    @NotNull private Long scheduleBlockId;
    @NotNull private LocalDate sessionDate;
    private String sessionStatus;
}
