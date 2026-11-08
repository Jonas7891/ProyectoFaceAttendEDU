package com.faceattend_edu.scheduling_service.domain.model;

import java.time.LocalDate;

/** Optional criteria for listing class sessions; a null field does not filter. */
public record ClassSessionFilter(Long scheduleBlockId, LocalDate from, LocalDate to, String sessionStatus) {

    public static final ClassSessionFilter NONE = new ClassSessionFilter(null, null, null, null);

    public ClassSessionFilter withSessionStatus(String status) {
        return new ClassSessionFilter(scheduleBlockId, from, to, status);
    }
}
