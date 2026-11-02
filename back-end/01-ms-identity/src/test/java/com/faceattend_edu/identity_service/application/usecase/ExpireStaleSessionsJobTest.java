package com.faceattend_edu.identity_service.application.usecase;

import com.faceattend_edu.identity_service.application.port.out.ExpireSessionsPort;
import com.faceattend_edu.identity_service.config.AuthProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ExpireStaleSessionsJob (AUD-72)")
class ExpireStaleSessionsJobTest {

    /** In-memory port: sessions are just their start dates; null in the list means already closed. */
    static class InMemorySessions implements ExpireSessionsPort {
        final List<LocalDateTime> activeStarts = new ArrayList<>();
        final List<LocalDateTime> cutoffs = new ArrayList<>();

        @Override
        public int closeActiveStartedBefore(LocalDateTime startedBefore, LocalDateTime closedAt, int batchSize) {
            cutoffs.add(startedBefore);
            int closed = 0;
            for (int i = 0; i < activeStarts.size() && closed < batchSize; ) {
                if (activeStarts.get(i).isBefore(startedBefore)) {
                    activeStarts.remove(i);
                    closed++;
                } else {
                    i++;
                }
            }
            return closed;
        }
    }

    private static AuthProperties props(long minutes) {
        AuthProperties p = new AuthProperties();
        p.setSessionTimeoutMinutes(minutes);
        return p;
    }

    @Test
    @DisplayName("givenExpiredAndLiveSessions_whenSweep_thenOnlyExpiredAreClosedAndCountIsReturned")
    void closesOnlyExpired() {
        InMemorySessions port = new InMemorySessions();
        LocalDateTime now = LocalDateTime.now();
        port.activeStarts.add(now.minusHours(9));
        port.activeStarts.add(now.minusHours(30));
        port.activeStarts.add(now.minusHours(1));
        port.activeStarts.add(now.minusMinutes(479));

        int closed = new ExpireStaleSessionsJob(port, props(480)).expireStaleSessions();

        assertThat(closed).isEqualTo(2);
        assertThat(port.activeStarts).hasSize(2).allMatch(s -> s.isAfter(now.minusHours(8)));
    }

    @Test
    @DisplayName("givenMoreExpiredThanOneBatch_whenSweep_thenDrainsInBatches")
    void drainsInBatches() {
        InMemorySessions port = new InMemorySessions();
        LocalDateTime old = LocalDateTime.now().minusDays(2);
        for (int i = 0; i < ExpireStaleSessionsJob.BATCH_SIZE * 2 + 7; i++) port.activeStarts.add(old);

        int closed = new ExpireStaleSessionsJob(port, props(480)).expireStaleSessions();

        assertThat(closed).isEqualTo(ExpireStaleSessionsJob.BATCH_SIZE * 2 + 7);
        assertThat(port.activeStarts).isEmpty();
    }

    @Test
    @DisplayName("givenNonPositiveTimeout_whenSweep_thenNothingIsClosed")
    void ignoresDisabledTimeout() {
        InMemorySessions port = new InMemorySessions();
        port.activeStarts.add(LocalDateTime.now().minusDays(5));

        assertThat(new ExpireStaleSessionsJob(port, props(0)).expireStaleSessions()).isZero();
        assertThat(port.cutoffs).isEmpty();
        assertThat(port.activeStarts).hasSize(1);
    }

    @Test
    @DisplayName("givenPropertyDisabled_whenContextStarts_thenJobBeanIsAbsent")
    void canBeDisabledByProperty() {
        ApplicationContextRunner runner = new ApplicationContextRunner()
                .withBean(ExpireSessionsPort.class, InMemorySessions::new)
                .withBean(AuthProperties.class, () -> props(480))
                .withUserConfiguration(ExpireStaleSessionsJob.class);

        runner.run(ctx -> assertThat(ctx).hasSingleBean(ExpireStaleSessionsJob.class));
        runner.withPropertyValues("faceattend.auth.session-expiry-job.enabled=false")
                .run(ctx -> assertThat(ctx).doesNotHaveBean(ExpireStaleSessionsJob.class));
    }
}
