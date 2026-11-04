package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.out.ExpireSessionsPort;
import com.faceattend_edu.identity_service.config.AuthProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * La expiración de GetUserSessionUseCaseImpl es perezosa (solo al presentar el
 * token): las sesiones que nadie vuelve a presentar quedaban Active para siempre.
 * Este barrido periódico las cierra con el mismo límite (start_date + timeout).
 * Se desactiva con faceattend.auth.session-expiry-job.enabled=false.
 */
@Component
@ConditionalOnProperty(name = "faceattend.auth.session-expiry-job.enabled", havingValue = "true", matchIfMissing = true)
public class ExpireStaleSessionsJob {

    private static final Logger log = LoggerFactory.getLogger(ExpireStaleSessionsJob.class);

    static final int BATCH_SIZE = 500;
    /** Tope de lotes por ejecución: un atraso enorme se drena en varias pasadas, sin monopolizar la conexión. */
    static final int MAX_BATCHES = 20;

    private final ExpireSessionsPort expireSessionsPort;
    private final AuthProperties authProperties;

    public ExpireStaleSessionsJob(ExpireSessionsPort expireSessionsPort, AuthProperties authProperties) {
        this.expireSessionsPort = expireSessionsPort;
        this.authProperties = authProperties;
    }

    @Scheduled(initialDelayString = "${faceattend.auth.session-expiry-job.interval-minutes:15}",
            fixedDelayString = "${faceattend.auth.session-expiry-job.interval-minutes:15}",
            timeUnit = java.util.concurrent.TimeUnit.MINUTES)
    public void runPeriodically() {
        expireStaleSessions();
    }

    /** Devuelve cuántas sesiones cerró; en el log solo va el recuento, nunca ids ni tokens. */
    public int expireStaleSessions() {
        Duration timeout = authProperties.sessionTimeout();
        if (timeout.isZero() || timeout.isNegative()) {
            return 0;
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minus(timeout);
        int total = 0;
        try {
            for (int i = 0; i < MAX_BATCHES; i++) {
                int closed = expireSessionsPort.closeActiveStartedBefore(cutoff, now, BATCH_SIZE);
                total += closed;
                if (closed < BATCH_SIZE) break;
            }
        } catch (RuntimeException e) {
            log.error("Stale session sweep stopped after {} sessions: {}", total, e.getClass().getSimpleName());
        }
        if (total > 0) log.info("Closed {} expired sessions", total);
        return total;
    }
}
