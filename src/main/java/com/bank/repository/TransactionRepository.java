package com.bank.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bank.entity.Transaction;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByFromAccount(String accountNumber);

}