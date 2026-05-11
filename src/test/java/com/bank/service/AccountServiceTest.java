package com.bank.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.bank.dto.CreateAccountDTO;
import com.bank.entity.Account;
import com.bank.entity.User;
import com.bank.event.producer.EventProducer;
import com.bank.exception.InvalidOperationException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.CardRepository;
import com.bank.repository.TransactionRepository;
import com.bank.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock private AccountRepository accountRepository;
    @Mock private UserRepository userRepository;
    @Mock private CardRepository cardRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private ReportService reportService;
    @Mock private EventProducer eventProducer;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks
    private AccountService accountService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("user@bank.com");
        testUser.setName("Test User");
        testUser.setRole("ROLE_USER");
    }

    private void mockSecurityContext() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@bank.com");
        SecurityContextHolder.setContext(securityContext);
        when(userRepository.findByEmail("user@bank.com")).thenReturn(Optional.of(testUser));
    }

    @Test
    void getAccount_shouldReturnAccountWhenExists() {
        Account account = new Account();
        account.setAccountNumber("WB1234567890");
        account.setBalance(new BigDecimal("500.00"));

        when(accountRepository.findByAccountNumber("WB1234567890")).thenReturn(Optional.of(account));

        Account result = accountService.getAccount("WB1234567890");

        assertNotNull(result);
        assertEquals("WB1234567890", result.getAccountNumber());
        assertEquals(new BigDecimal("500.00"), result.getBalance());
    }

    @Test
    void getAccount_shouldThrowWhenNotFound() {
        when(accountRepository.findByAccountNumber("WB0000000000")).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> accountService.getAccount("WB0000000000"));

        assertTrue(ex.getMessage().contains("WB0000000000"));
    }

    @Test
    void deposit_shouldRejectZeroAmount() {
        assertThrows(InvalidOperationException.class,
                () -> accountService.deposit("WB123", BigDecimal.ZERO, "REQ1"));
    }

    @Test
    void deposit_shouldRejectNegativeAmount() {
        assertThrows(InvalidOperationException.class,
                () -> accountService.deposit("WB123", new BigDecimal("-50"), "REQ2"));
    }

    @Test
    void withdraw_shouldRejectZeroAmount() {
        assertThrows(InvalidOperationException.class,
                () -> accountService.withdraw("WB123", BigDecimal.ZERO, "REQ1"));
    }

    @Test
    void withdraw_shouldRejectNegativeAmount() {
        assertThrows(InvalidOperationException.class,
                () -> accountService.withdraw("WB123", new BigDecimal("-50"), "REQ2"));
    }

    @Test
    void getMyAccounts_shouldReturnUserAccounts() {
        mockSecurityContext();

        Account acc1 = new Account();
        acc1.setAccountNumber("WB111");
        Account acc2 = new Account();
        acc2.setAccountNumber("WB222");

        when(accountRepository.findByUserId(1L)).thenReturn(List.of(acc1, acc2));

        List<Account> accounts = accountService.getMyAccounts();

        assertEquals(2, accounts.size());

        SecurityContextHolder.clearContext();
    }

    @Test
    void createAccount_shouldRejectInvalidAccountType() {
        mockSecurityContext();

        CreateAccountDTO dto = new CreateAccountDTO();
        dto.setAccountType("INVALID_TYPE");
        dto.setName("Test");

        when(userRepository.existsById(1L)).thenReturn(true);

        assertThrows(InvalidOperationException.class,
                () -> accountService.createAccount(dto));

        SecurityContextHolder.clearContext();
    }

    @Test
    void calculateInterest_shouldReturnCorrectAmount() {
        BigDecimal balance = new BigDecimal("10000.00");
        BigDecimal interest = accountService.calculateInterest(balance);

        // 10000 * 3.5 / 100 = 350.0000
        assertEquals(new BigDecimal("350.0000"), interest);
    }
}
