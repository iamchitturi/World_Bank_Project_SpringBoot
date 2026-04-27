package com.bank.service;

import com.bank.entity.Account;
import com.bank.repository.AccountRepository;
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

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public Page<Account> getAccountsWithPagination(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return accountRepository.findAll(pageable);
    }

    public double calculateInterest(double balance) {
        double rate = 3.5;
        return balance * rate / 100;
    }

    @Transactional
    public Account createAccount(Account account) {
        log.info("Create account request started");

        if (accountRepository.existsByAccountNumber(account.getAccountNumber())) {
            throw new RuntimeException("Account number already exists");
        }

        if (accountRepository.existsByUserId(account.getUserId())) {
            throw new RuntimeException("User ID already exists");
        }

        return accountRepository.save(account);
    }

    public Account getAccount(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    public double checkBalance(String accountNumber) {
        return getAccount(accountNumber).getBalance();
    }

    @Transactional
    public Account deposit(String accountNumber, double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }

        Account acc = getAccount(accountNumber);
        acc.setBalance(acc.getBalance() + amount);

        try {
            return accountRepository.save(acc);
        } catch (OptimisticLockingFailureException ex) {
            throw new RuntimeException("Concurrent update detected. Please retry.");
        }
    }

    @Transactional
    public Account withdraw(String accountNumber, double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }

        Account acc = getAccount(accountNumber);

        if (acc.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }

        acc.setBalance(acc.getBalance() - amount);

        try {
            return accountRepository.save(acc);
        } catch (OptimisticLockingFailureException ex) {
            throw new RuntimeException("Concurrent update detected. Please retry.");
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
