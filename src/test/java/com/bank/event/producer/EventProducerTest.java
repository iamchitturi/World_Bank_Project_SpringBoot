package com.bank.event.producer;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

import com.bank.event.AccountEvent;
import com.bank.event.TransactionEvent;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

@ExtendWith(MockitoExtension.class)
class EventProducerTest {

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private EventProducer eventProducer;

    @Test
    void shouldPublishTransactionEventToCorrectTopic() {
        TransactionEvent event = new TransactionEvent(
                "TRANSFER", "WB111", "WB222",
                new BigDecimal("100.00"), "REQ-001", "user@bank.com");

        eventProducer.publishTransactionEvent(event);

        verify(kafkaTemplate).send(
                eq(EventProducer.TOPIC_TRANSACTIONS),
                eq("REQ-001"),
                eq(event));
    }

    @Test
    void shouldPublishAccountEventToCorrectTopic() {
        AccountEvent event = new AccountEvent(
                "CREATED", "WB333", 1L, "SAVINGS", "admin@bank.com");

        eventProducer.publishAccountEvent(event);

        verify(kafkaTemplate).send(
                eq(EventProducer.TOPIC_ACCOUNTS),
                eq("WB333"),
                eq(event));
    }
}
