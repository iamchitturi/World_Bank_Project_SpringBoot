package com.bank.repository;

import com.bank.entity.Card;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByAccountId(Long accountId);

    List<Card> findByAccountIdIn(List<Long> accountIds);

    boolean existsByCardNumber(String cardNumber);

    void deleteByAccountId(Long accountId);
}
