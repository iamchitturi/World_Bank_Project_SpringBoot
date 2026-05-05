package com.bank.repository;

import com.bank.entity.Transaction;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByFromAccountOrToAccount(String fromAccount, String toAccount);

    Page<Transaction> findByFromAccountOrToAccount(String fromAccount, String toAccount, Pageable pageable);

    List<Transaction> findByFromAccountOrToAccountAndIdLessThanOrderByIdDesc(String fromAccount, String toAccount, Long id, Pageable pageable);

    Optional<Transaction> findByRequestId(String requestId);
}
