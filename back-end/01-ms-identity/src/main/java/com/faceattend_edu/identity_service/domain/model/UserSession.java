package com.faceattend_edu.identity_service.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserSession {
    private UUID sessionId;
    private User userId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String sourceIp;
    private String sessionStatus;

    public void start() {
        if (this.sessionId == null) this.sessionId = UUID.randomUUID();
        this.startDate = LocalDateTime.now();
        this.endDate = null;
        this.sessionStatus = "ACTIVE";
    }

    public void end() {
        this.endDate = LocalDateTime.now();
        this.sessionStatus = "ENDED";
    }

    public boolean isActive() {
        return "ACTIVE".equals(this.sessionStatus) && this.endDate == null;
    }

    public long durationSeconds() {
        if (this.startDate == null) return 0L;
        LocalDateTime end = this.endDate == null ? LocalDateTime.now() : this.endDate;
        return Math.max(0, Duration.between(this.startDate, end).getSeconds());
    }
}
