package com.bank.service;

import com.bank.dto.CreateAccountDTO;
import com.bank.entity.Account;
import com.bank.exception.InsufficientBalanceException;
import com.bank.exception.InvalidOperationException;
import com.bank.exception.ResourceAlreadyExistsException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);
    private static final BigDecimal INTEREST_RATE = new BigDecimal("3.5");

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountService(AccountRepository accountRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    public Page<Account> getAccountsWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return accountRepository.findAll(pageable);
    }

    public BigDecimal calculateInterest(BigDecimal balance) {
        return balance.multiply(INTEREST_RATE)
                .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
    }

    @Transactional
    public Account createAccount(CreateAccountDTO dto) {
        log.info("Create account request started");

        if (accountRepository.existsByAccountNumber(dto.getAccountNumber())) {
            throw new ResourceAlreadyExistsException("Account number already exists");
        }

        if (!userRepository.existsById(dto.getUserId())) {
            throw new ResourceNotFoundException("User not found with id: " + dto.getUserId());
        }

        if (accountRepository.existsByUserId(dto.getUserId())) {
            throw new ResourceAlreadyExistsException("User ID already has an account");
        }

        Account account = new Account();
        account.setAccountNumber(dto.getAccountNumber());
        account.setUserId(dto.getUserId());
        account.setName(dto.getName());
        account.setBalance(BigDecimal.ZERO);

        return accountRepository.save(account);
    }

    public Account getAccount(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
    }

    public BigDecimal checkBalance(String accountNumber) {
        return getAccount(accountNumber).getBalance();
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
        accountRepository.delete(acc);
        return "Account deleted successfully";
    }

    @Transactional
    public Account updateAccount(String accountNumber, Account updatedAccount) {
        Account acc = getAccount(accountNumber);
        acc.setName(updatedAccount.getName());
        return accountRepository.save(acc);
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }
}
