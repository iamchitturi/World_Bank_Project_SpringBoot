package com.bank.repository;

import com.bank.entity.Account;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByNameContainingIgnoreCase(String name);

    Optional<Account> findByAccountNumber(String accountNumber);

    List<Account> findByUserId(Long userId);

    boolean existsByAccountNumber(String accountNumber);
}
