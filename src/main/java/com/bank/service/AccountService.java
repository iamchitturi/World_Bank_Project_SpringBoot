package com.bank.service;

import com.bank.dto.CreateAccountDTO;
import com.bank.entity.Account;
import com.bank.entity.User;
import com.bank.event.AccountEvent;
import com.bank.event.TransactionEvent;
import com.bank.event.producer.EventProducer;
import com.bank.exception.InsufficientBalanceException;
import com.bank.exception.InvalidOperationException;
import com.bank.exception.ResourceAlreadyExistsException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.CardRepository;
import com.bank.repository.TransactionRepository;
import com.bank.repository.UserRepository;
import com.bank.entity.Transaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);
    private static final BigDecimal INTEREST_RATE = new BigDecimal("3.5");
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final CardRepository cardRepository;
    private final TransactionRepository transactionRepository;
    private final ReportService reportService;
    private final EventProducer eventProducer;

    public AccountService(AccountRepository accountRepository, UserRepository userRepository,
                          CardRepository cardRepository, TransactionRepository transactionRepository,
                          ReportService reportService, EventProducer eventProducer) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.cardRepository = cardRepository;
        this.transactionRepository = transactionRepository;
        this.reportService = reportService;
        this.eventProducer = eventProducer;
    }

    // ===== Account number generation =====
    private String generateAccountNumber() {
        String accNum;
        do {
            long num = 1_000_000_000L + (long) (RANDOM.nextDouble() * 9_000_000_000L);
            accNum = "WB" + num;
        } while (accountRepository.existsByAccountNumber(accNum));
        return accNum;
    }

    // ===== Current user helpers =====
    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    public void enforceOwnership(String accountNumber) {
        if (isAdmin()) return;
        User user = getCurrentUser();
        Account acc = getAccount(accountNumber);
        if (!acc.getUserId().equals(user.getId())) {
            throw new InvalidOperationException("Access denied: you can only access your own account");
        }
    }

    public void enforceStrictOwnership(String accountNumber) {
        User user = getCurrentUser();
        Account acc = getAccount(accountNumber);
        if (!acc.getUserId().equals(user.getId())) {
            throw new InvalidOperationException("Access denied: strict ownership required");
        }
    }

    public void enforceAccountOwnership(Long accountId) {
        if (isAdmin()) return;
        User user = getCurrentUser();
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        if (!acc.getUserId().equals(user.getId())) {
            throw new InvalidOperationException("Access denied: you can only access your own account");
        }
    }

    // ===== Multi-account queries =====
    @Cacheable(value = "userAccounts", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    public List<Account> getMyAccounts() {
        User user = getCurrentUser();
        return accountRepository.findByUserId(user.getId());
    }

    public List<Account> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    // ===== CRUD =====
    @Caching(evict = {
            @CacheEvict(value = "userAccounts", allEntries = true),
            @CacheEvict(value = "reports", allEntries = true)
    })
    @Transactional
    public Account createAccount(CreateAccountDTO dto) {
        log.info("Create account request started");

        Long userId;
        if (isAdmin() && dto.getUserId() != null) {
            userId = dto.getUserId(); // Admin can create for any user
        } else {
            userId = getCurrentUser().getId(); // Customer creates for themselves
        }

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        String type = dto.getAccountType().toUpperCase();
        if (!type.equals("SAVINGS") && !type.equals("PREMIUM") && !type.equals("CURRENT")) {
            throw new InvalidOperationException("Invalid account type. Must be SAVINGS, PREMIUM, or CURRENT");
        }

        Account account = new Account();
        account.setAccountNumber(generateAccountNumber());
        account.setUserId(userId);
        account.setName(dto.getName());
        account.setAccountType(type);
        account.setBalance(BigDecimal.ZERO);

        Account saved = accountRepository.save(account);

        // Publish account creation event to Kafka (non-blocking)
        try {
            eventProducer.publishAccountEvent(
                    new AccountEvent("CREATED", saved.getAccountNumber(), userId, type, getCurrentUser().getEmail()));
        } catch (Exception e) {
            log.warn("Failed to publish account creation event: {}", e.getMessage());
        }

        return saved;
    }

    @Cacheable(value = "accounts", key = "#accountNumber")
    public Account getAccount(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
    }

    public Account getAccountById(Long accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));
    }

    public BigDecimal checkBalance(String accountNumber) {
        return getAccount(accountNumber).getBalance();
    }

    public BigDecimal calculateInterest(BigDecimal balance) {
        return balance.multiply(INTEREST_RATE)
                .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
    }

    @Caching(evict = {
            @CacheEvict(value = "accounts", key = "#accountNumber"),
            @CacheEvict(value = "userAccounts", allEntries = true),
            @CacheEvict(value = "reports", allEntries = true)
    })
    @Transactional
    public Account deposit(String accountNumber, BigDecimal amount, String idempotencyKey) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException("Amount must be greater than 0");
        }
        if (transactionRepository.findByRequestId(idempotencyKey).isPresent()) {
            return accountRepository.findByAccountNumber(accountNumber)
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
        }
        
        Account acc = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
        acc.setBalance(acc.getBalance().add(amount));
        try {
            acc = accountRepository.save(acc);
            
            Transaction txn = new Transaction();
            txn.setFromAccount("SYSTEM");
            txn.setToAccount(accountNumber);
            txn.setAmount(amount);
            txn.setDate(LocalDateTime.now());
            txn.setRequestId(idempotencyKey);
            transactionRepository.save(txn);
            
            // Publish deposit event to Kafka (non-blocking)
            try {
                eventProducer.publishTransactionEvent(
                        new TransactionEvent("DEPOSIT", "SYSTEM", accountNumber, amount, idempotencyKey,
                                SecurityContextHolder.getContext().getAuthentication().getName()));
            } catch (Exception e) {
                log.warn("Failed to publish deposit event: {}", e.getMessage());
            }

            return acc;
        } catch (OptimisticLockingFailureException ex) {
            throw new InvalidOperationException("Concurrent update detected. Please retry.");
        }
    }

    @Caching(evict = {
            @CacheEvict(value = "accounts", key = "#accountNumber"),
            @CacheEvict(value = "userAccounts", allEntries = true),
            @CacheEvict(value = "reports", allEntries = true)
    })
    @Transactional
    public Account withdraw(String accountNumber, BigDecimal amount, String idempotencyKey) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException("Amount must be greater than 0");
        }
        if (transactionRepository.findByRequestId(idempotencyKey).isPresent()) {
            return accountRepository.findByAccountNumber(accountNumber)
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
        }

        Account acc = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
        if (acc.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }
        acc.setBalance(acc.getBalance().subtract(amount));
        try {
            acc = accountRepository.save(acc);
            
            Transaction txn = new Transaction();
            txn.setFromAccount(accountNumber);
            txn.setToAccount("ATM_WITHDRAWAL");
            txn.setAmount(amount);
            txn.setDate(LocalDateTime.now());
            txn.setRequestId(idempotencyKey);
            transactionRepository.save(txn);

            // Publish withdrawal event to Kafka (non-blocking)
            try {
                eventProducer.publishTransactionEvent(
                        new TransactionEvent("WITHDRAWAL", accountNumber, "ATM_WITHDRAWAL", amount, idempotencyKey,
                                SecurityContextHolder.getContext().getAuthentication().getName()));
            } catch (Exception e) {
                log.warn("Failed to publish withdrawal event: {}", e.getMessage());
            }

            return acc;
        } catch (OptimisticLockingFailureException ex) {
            throw new InvalidOperationException("Concurrent update detected. Please retry.");
        }
    }

    @Caching(evict = {
            @CacheEvict(value = "accounts", key = "#accountNumber"),
            @CacheEvict(value = "userAccounts", allEntries = true),
            @CacheEvict(value = "reports", allEntries = true)
    })
    @Transactional
    public String deleteAccount(String accountNumber) {
        Account acc = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
        cardRepository.deleteByAccountId(acc.getId());
        accountRepository.delete(acc);
        return "Account deleted successfully";
    }

    @Transactional
    public Account updateAccount(String accountNumber, Account updatedAccount) {
        Account acc = getAccount(accountNumber);
        acc.setName(updatedAccount.getName());
        return accountRepository.save(acc);
    }

    public Page<Account> getAccountsWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return accountRepository.findAll(pageable);
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }
}
