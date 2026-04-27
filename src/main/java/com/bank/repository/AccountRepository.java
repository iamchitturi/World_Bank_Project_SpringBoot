package com.bank.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bank.entity.Account;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
	
	static List<Account> findByNameContaining(String name) {
		// TODO Auto-generated method stub
		return null;
	}
	Page<Account> findAll(Pageable pageable);
    boolean existsByAccountNumber(String AccountNumber);

    boolean existsByUserId(String userId);

	Account findByAccountNumber(String accountNumber);
	Account findByUserId(Long long1);
	Account save(String accountNumber);

}