package com.faceattend_edu.scheduling_service.infrastructure.messaging;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.concurrent.CompletableFuture;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** M2: an event leaves only when its transaction commits, and a failed delivery is not fatal. */
class DomainEventPublisherTest {

    @SuppressWarnings("unchecked")
    private final KafkaTemplate<String, String> kafka = mock(KafkaTemplate.class);
    private final DomainEventPublisher publisher = new DomainEventPublisher(kafka);

    @AfterEach
    void clear() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void withoutATransactionTheEventGoesOutAtOnce() {
        when(kafka.send("topic", "{}")).thenReturn(new CompletableFuture<>());
        publisher.publish("topic", "{}");
        verify(kafka).send("topic", "{}");
    }

    @Test
    void insideATransactionTheEventWaitsForTheCommit() {
        when(kafka.send("topic", "{}")).thenReturn(new CompletableFuture<>());
        TransactionSynchronizationManager.initSynchronization();
        publisher.publish("topic", "{}");
        verify(kafka, never()).send(anyString(), anyString());

        TransactionSynchronizationManager.getSynchronizations().forEach(TransactionSynchronization::afterCommit);
        verify(kafka).send("topic", "{}");
    }

    @Test
    void aRolledBackTransactionPublishesNothing() {
        TransactionSynchronizationManager.initSynchronization();
        publisher.publish("topic", "{}");
        TransactionSynchronizationManager.getSynchronizations()
                .forEach(s -> s.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK));
        verify(kafka, never()).send(anyString(), anyString());
    }

    @Test
    void aFailedDeliveryIsLoggedNotThrown() {
        when(kafka.send("topic", "{}")).thenReturn(CompletableFuture.failedFuture(new IllegalStateException("broker down")));
        assertThatCode(() -> publisher.publish("topic", "{}")).doesNotThrowAnyException();

        when(kafka.send("other", "{}")).thenThrow(new IllegalStateException("no metadata"));
        assertThatCode(() -> publisher.publish("other", "{}")).doesNotThrowAnyException();
    }
}
