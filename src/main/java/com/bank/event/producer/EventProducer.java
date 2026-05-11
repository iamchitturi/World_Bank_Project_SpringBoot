package com.bank.event.producer;

import com.bank.event.AccountEvent;
import com.bank.event.TransactionEvent;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes domain events to Kafka topics.
 * Protected by Resilience4j circuit breaker and retry to prevent
 * cascading failures if Kafka is unavailable.
 */
@Component
public class EventProducer {

    private static final Logger log = LoggerFactory.getLogger(EventProducer.class);

    public static final String TOPIC_TRANSACTIONS = "transaction-events";
    public static final String TOPIC_ACCOUNTS = "account-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public EventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @CircuitBreaker(name = "kafkaProducer", fallbackMethod = "transactionFallback")
    @Retry(name = "kafkaRetry")
    public void publishTransactionEvent(TransactionEvent event) {
        log.info("Publishing transaction event: type={}, requestId={}", event.getEventType(), event.getRequestId());
        kafkaTemplate.send(TOPIC_TRANSACTIONS, event.getRequestId(), event);
    }

    @CircuitBreaker(name = "kafkaProducer", fallbackMethod = "accountFallback")
    @Retry(name = "kafkaRetry")
    public void publishAccountEvent(AccountEvent event) {
        log.info("Publishing account event: type={}, account={}", event.getEventType(), event.getAccountNumber());
        kafkaTemplate.send(TOPIC_ACCOUNTS, event.getAccountNumber(), event);
    }

    // ===== Fallbacks (Circuit Breaker open or retries exhausted) =====

    @SuppressWarnings("unused")
    private void transactionFallback(TransactionEvent event, Throwable t) {
        log.error("CIRCUIT BREAKER OPEN — Failed to publish transaction event: {}. Error: {}",
                event.getRequestId(), t.getMessage());
        // In production: persist to a dead-letter table for later replay
    }

    @SuppressWarnings("unused")
    private void accountFallback(AccountEvent event, Throwable t) {
        log.error("CIRCUIT BREAKER OPEN — Failed to publish account event: {}. Error: {}",
                event.getAccountNumber(), t.getMessage());
    }
}
