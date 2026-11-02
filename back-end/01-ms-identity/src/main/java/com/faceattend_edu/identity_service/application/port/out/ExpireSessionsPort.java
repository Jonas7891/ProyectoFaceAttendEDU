package com.faceattend_edu.identity_service.application.port.out;

import java.time.LocalDateTime;

public interface ExpireSessionsPort {

    /**
     * Cierra, como máximo {@code batchSize}, las sesiones Active iniciadas antes
     * de {@code startedBefore}: status Closed y end_date = {@code closedAt}.
     * Devuelve cuántas cerró (menos que {@code batchSize} = no quedan más).
     */
    int closeActiveStartedBefore(LocalDateTime startedBefore, LocalDateTime closedAt, int batchSize);
}
