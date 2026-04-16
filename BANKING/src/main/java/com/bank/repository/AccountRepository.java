package com.bank.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bank.entity.Account;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    boolean existsByAccountNumber(String AccountNumber);

    boolean existsByUserId(String userId);

	Account findByAccountNumber(String accountNumber);
	Account findByUserId(String string);
	Account save(String accountNumber);

}