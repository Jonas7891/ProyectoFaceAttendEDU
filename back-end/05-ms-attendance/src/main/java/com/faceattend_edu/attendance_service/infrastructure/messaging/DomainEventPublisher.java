package com.faceattend_edu.attendance_service.infrastructure.messaging;

import com.faceattend_edu.attendance_service.domain.port.out.EventPublisherPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.concurrent.CompletableFuture;
import java.util.function.Supplier;

/**
 * Kafka adapter of {@link EventPublisherPort}. Events leave when the current transaction
 * commits, so a rolled-back change never announces an event; without a transaction they leave
 * at once. There is no outbox: an event is lost when Kafka is down, but the failure is logged
 * whether it happens while sending or later, when the broker answers.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DomainEventPublisher implements EventPublisherPort {

    private final KafkaTemplate<String, String> kafkaTemplate;

    @Override
    public void publishAfterCommit(String topic, String key, String payload) {
        afterCommit(topic, () -> kafkaTemplate.send(topic, key, payload));
    }

    @Override
    public void publish(String topic, String payload) {
        afterCommit(topic, () -> kafkaTemplate.send(topic, payload));
    }

    private void afterCommit(String topic, Supplier<CompletableFuture<SendResult<String, String>>> send) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            send(topic, send);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                send(topic, send);
            }
        });
    }

    private void send(String topic, Supplier<CompletableFuture<SendResult<String, String>>> send) {
        try {
            CompletableFuture<SendResult<String, String>> result = send.get();
            if (result != null) {
                result.whenComplete((ok, ex) -> {
                    if (ex != null) log.warn("Kafka delivery failed topic={} error={}", topic, ex.getMessage());
                });
            }
        } catch (Exception ex) {
            log.warn("Kafka publish failed topic={} error={}", topic, ex.getMessage());
        }
    }
}
