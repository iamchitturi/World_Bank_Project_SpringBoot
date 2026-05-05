package com.bank.service;

import com.bank.entity.Account;
import com.bank.entity.Transaction;
import com.bank.exception.InsufficientBalanceException;
import com.bank.exception.InvalidOperationException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public TransactionService(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public String transfer(String fromAcc, String toAcc, BigDecimal amount, String requestId) {

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException("Amount must be greater than 0");
        }

        if (fromAcc.equals(toAcc)) {
            throw new InvalidOperationException("Self transfer is not allowed");
        }

        if (transactionRepository.findByRequestId(requestId).isPresent()) {
            return "Transfer already processed for requestId: " + requestId;
        }

        Account sender = accountRepository.findByAccountNumber(fromAcc)
                .orElseThrow(() -> new ResourceNotFoundException("Sender account not found"));

        Account receiver = accountRepository.findByAccountNumber(toAcc)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver account not found"));

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        // Prevent Deadlock by locking in a consistent order
        Account first = sender.getId() < receiver.getId() ? sender : receiver;
        Account second = sender.getId() < receiver.getId() ? receiver : sender;

        try {
            accountRepository.save(first);
            accountRepository.save(second);
        } catch (OptimisticLockingFailureException e) {
            throw new InvalidOperationException("Concurrent update detected. Please retry.");
        }

        Transaction txn = new Transaction();
        txn.setFromAccount(fromAcc);
        txn.setToAccount(toAcc);
        txn.setAmount(amount);
        txn.setDate(LocalDateTime.now());
        txn.setRequestId(requestId);

        transactionRepository.save(txn);

        log.info("Transfer successful for requestId {}", requestId);

        return "Transfer successful";
    }

    public List<Transaction> getTransactionHistory(String accountNumber, Long cursor, int size) {
        Pageable pageable = PageRequest.of(0, size);
        if (cursor == null || cursor <= 0) {
            cursor = Long.MAX_VALUE; // Fetch from top
        }
        return transactionRepository.findByFromAccountOrToAccountAndIdLessThanOrderByIdDesc(
            accountNumber, accountNumber, cursor, pageable);
    }
}
