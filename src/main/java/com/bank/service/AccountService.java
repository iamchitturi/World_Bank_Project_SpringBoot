package com.bank.service;

import com.bank.dto.CreateAccountDTO;
import com.bank.entity.Account;
import com.bank.entity.User;
import com.bank.exception.InsufficientBalanceException;
import com.bank.exception.InvalidOperationException;
import com.bank.exception.ResourceAlreadyExistsException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.CardRepository;
import com.bank.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    public AccountService(AccountRepository accountRepository, UserRepository userRepository, CardRepository cardRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.cardRepository = cardRepository;
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
    public List<Account> getMyAccounts() {
        User user = getCurrentUser();
        return accountRepository.findByUserId(user.getId());
    }

    public List<Account> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    // ===== CRUD =====
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

        return accountRepository.save(account);
    }

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

    @Transactional
    public Account deposit(String accountNumber, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException("Amount must be greater than 0");
        }
        Account acc = getAccount(accountNumber);
        acc.setBalance(acc.getBalance().add(amount));
        try {
            return accountRepository.save(acc);
        } catch (OptimisticLockingFailureException ex) {
            throw new InvalidOperationException("Concurrent update detected. Please retry.");
        }
    }

    @Transactional
    public Account withdraw(String accountNumber, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException("Amount must be greater than 0");
        }
        Account acc = getAccount(accountNumber);
        if (acc.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }
        acc.setBalance(acc.getBalance().subtract(amount));
        try {
            return accountRepository.save(acc);
        } catch (OptimisticLockingFailureException ex) {
            throw new InvalidOperationException("Concurrent update detected. Please retry.");
        }
    }

    @Transactional
    public String deleteAccount(String accountNumber) {
        Account acc = getAccount(accountNumber);
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
