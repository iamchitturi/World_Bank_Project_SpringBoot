package com.bank.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.bank.entity.Account;
import com.bank.event.TransactionEvent;
import com.bank.event.producer.EventProducer;
import com.bank.exception.InsufficientBalanceException;
import com.bank.exception.InvalidOperationException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.TransactionRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private EventProducer eventProducer;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void shouldRejectZeroAmount() {
        InvalidOperationException ex = assertThrows(InvalidOperationException.class,
                () -> transactionService.transfer("A1", "A2", BigDecimal.ZERO, "REQ0"));

        assertEquals("Amount must be greater than 0", ex.getMessage());
    }

    @Test
    void shouldRejectNegativeAmount() {
        InvalidOperationException ex = assertThrows(InvalidOperationException.class,
                () -> transactionService.transfer("A1", "A2", new BigDecimal("-10"), "REQ0"));

        assertEquals("Amount must be greater than 0", ex.getMessage());
    }

    @Test
    void shouldRejectSelfTransfer() {
        InvalidOperationException ex = assertThrows(InvalidOperationException.class,
                () -> transactionService.transfer("A1", "A1", BigDecimal.TEN, "REQ1"));

        assertEquals("Self transfer is not allowed", ex.getMessage());
    }

    @Test
    void shouldReturnDuplicateMessageForExistingRequestId() {
        when(transactionRepository.findByRequestId("REQ1")).thenReturn(Optional.of(new com.bank.entity.Transaction()));

        String result = transactionService.transfer("A1", "A2", BigDecimal.TEN, "REQ1");
        assertEquals("Transfer already processed for requestId: REQ1", result);
    }

    @Test
    void shouldFailWhenSenderMissing() {
        when(transactionRepository.findByRequestId("REQ2")).thenReturn(Optional.empty());
        when(accountRepository.findByAccountNumber("A1")).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> transactionService.transfer("A1", "A2", BigDecimal.TEN, "REQ2"));

        assertEquals("Sender account not found", ex.getMessage());
    }

    @Test
    void shouldFailWhenReceiverMissing() {
        Account sender = new Account();
        sender.setAccountNumber("A1");
        sender.setBalance(new BigDecimal("100.00"));

        when(transactionRepository.findByRequestId("REQ4")).thenReturn(Optional.empty());
        when(accountRepository.findByAccountNumber("A1")).thenReturn(Optional.of(sender));
        when(accountRepository.findByAccountNumber("A2")).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> transactionService.transfer("A1", "A2", BigDecimal.TEN, "REQ4"));

        assertEquals("Receiver account not found", ex.getMessage());
    }

    @Test
    void shouldFailWhenInsufficientBalance() {
        Account sender = new Account();
        sender.setAccountNumber("A1");
        sender.setBalance(new BigDecimal("20.00"));

        Account receiver = new Account();
        receiver.setAccountNumber("A2");
        receiver.setBalance(new BigDecimal("10.00"));

        when(transactionRepository.findByRequestId("REQ3")).thenReturn(Optional.empty());
        when(accountRepository.findByAccountNumber("A1")).thenReturn(Optional.of(sender));
        when(accountRepository.findByAccountNumber("A2")).thenReturn(Optional.of(receiver));

        InsufficientBalanceException ex = assertThrows(InsufficientBalanceException.class,
                () -> transactionService.transfer("A1", "A2", new BigDecimal("50.00"), "REQ3"));

        assertEquals("Insufficient balance", ex.getMessage());
    }

    @Test
    void shouldTransferSuccessfullyAndPublishEvent() {
        Account sender = new Account();
        sender.setId(1L);
        sender.setAccountNumber("A1");
        sender.setBalance(new BigDecimal("100.00"));

        Account receiver = new Account();
        receiver.setId(2L);
        receiver.setAccountNumber("A2");
        receiver.setBalance(new BigDecimal("50.00"));

        when(transactionRepository.findByRequestId("REQ5")).thenReturn(Optional.empty());
        when(accountRepository.findByAccountNumber("A1")).thenReturn(Optional.of(sender));
        when(accountRepository.findByAccountNumber("A2")).thenReturn(Optional.of(receiver));

        // Mock SecurityContext for event publishing
        org.springframework.security.core.context.SecurityContext securityContext =
                org.mockito.Mockito.mock(org.springframework.security.core.context.SecurityContext.class);
        org.springframework.security.core.Authentication authentication =
                org.mockito.Mockito.mock(org.springframework.security.core.Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@bank.com");
        org.springframework.security.core.context.SecurityContextHolder.setContext(securityContext);

        String result = transactionService.transfer("A1", "A2", new BigDecimal("30.00"), "REQ5");

        assertEquals("Transfer successful", result);
        assertEquals(new BigDecimal("70.00"), sender.getBalance());
        assertEquals(new BigDecimal("80.00"), receiver.getBalance());
        verify(eventProducer).publishTransactionEvent(any(TransactionEvent.class));

        // Cleanup
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }
}
