package com.bank.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.bank.entity.Account;
import com.bank.repository.AccountRepository;
import com.bank.repository.TransactionRepository;
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

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void shouldRejectSelfTransfer() {
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> transactionService.transfer("A1", "A1", 10.0, "REQ1"));

        assertEquals("Self transfer is not allowed", ex.getMessage());
    }

    @Test
    void shouldReturnDuplicateMessageForExistingRequestId() {
        when(transactionRepository.findByRequestId("REQ1")).thenReturn(Optional.of(new com.bank.entity.Transaction()));

        String result = transactionService.transfer("A1", "A2", 10.0, "REQ1");
        assertEquals("Transfer already processed for requestId: REQ1", result);
    }

    @Test
    void shouldFailWhenSenderMissing() {
        when(transactionRepository.findByRequestId("REQ2")).thenReturn(Optional.empty());
        when(accountRepository.findByAccountNumber("A1")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> transactionService.transfer("A1", "A2", 10.0, "REQ2"));

        assertEquals("Sender account not found", ex.getMessage());
    }

    @Test
    void shouldFailWhenInsufficientBalance() {
        Account sender = new Account();
        sender.setAccountNumber("A1");
        sender.setBalance(20.0);

        Account receiver = new Account();
        receiver.setAccountNumber("A2");
        receiver.setBalance(10.0);

        when(transactionRepository.findByRequestId("REQ3")).thenReturn(Optional.empty());
        when(accountRepository.findByAccountNumber("A1")).thenReturn(Optional.of(sender));
        when(accountRepository.findByAccountNumber("A2")).thenReturn(Optional.of(receiver));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> transactionService.transfer("A1", "A2", 50.0, "REQ3"));

        assertEquals("Insufficient balance", ex.getMessage());
    }
}
