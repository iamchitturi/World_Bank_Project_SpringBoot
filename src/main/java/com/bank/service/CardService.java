package com.bank.service;

import com.bank.dto.CreateCardDTO;
import com.bank.entity.Card;
import com.bank.exception.InvalidOperationException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.CardRepository;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CardService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private final CardRepository cardRepository;
    private final AccountService accountService;

    public CardService(CardRepository cardRepository, AccountService accountService) {
        this.cardRepository = cardRepository;
        this.accountService = accountService;
    }

    @Transactional
    public Card issueCard(CreateCardDTO dto) {
        accountService.enforceAccountOwnership(dto.getAccountId());

        String type = dto.getCardType().toUpperCase();
        if (!type.equals("DEBIT") && !type.equals("CREDIT")) {
            throw new InvalidOperationException("Card type must be DEBIT or CREDIT");
        }

        var account = accountService.getAccountById(dto.getAccountId());

        Card card = new Card();
        card.setCardNumber(generateCardNumber());
        card.setCardType(type);
        card.setCardholderName(account.getName());
        card.setCvv(generateCvv());
        card.setExpiryDate(generateExpiry());
        card.setAccountId(dto.getAccountId());

        return cardRepository.save(card);
    }

    public List<Card> getCardsByAccount(Long accountId) {
        accountService.enforceAccountOwnership(accountId);
        return cardRepository.findByAccountId(accountId);
    }

    public List<Card> getMyCards() {
        List<Long> accountIds = accountService.getMyAccounts().stream()
                .map(a -> a.getId()).toList();
        return cardRepository.findByAccountIdIn(accountIds);
    }

    @Transactional
    public Card blockCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
        accountService.enforceAccountOwnership(card.getAccountId());
        card.setStatus("BLOCKED");
        return cardRepository.save(card);
    }

    @Transactional
    public Card activateCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
        accountService.enforceAccountOwnership(card.getAccountId());
        card.setStatus("ACTIVE");
        return cardRepository.save(card);
    }

    // ===== Generators =====
    private String generateCardNumber() {
        String num;
        do {
            StringBuilder sb = new StringBuilder();
            // Start with 4 (Visa-like) for debit look
            sb.append("4");
            for (int i = 1; i < 15; i++) sb.append(RANDOM.nextInt(10));
            // Luhn check digit
            sb.append(luhnCheckDigit(sb.toString()));
            num = sb.toString();
        } while (cardRepository.existsByCardNumber(num));
        return num;
    }

    private int luhnCheckDigit(String partial) {
        int sum = 0;
        boolean doubleDigit = true;
        for (int i = partial.length() - 1; i >= 0; i--) {
            int d = partial.charAt(i) - '0';
            if (doubleDigit) { d *= 2; if (d > 9) d -= 9; }
            sum += d;
            doubleDigit = !doubleDigit;
        }
        return (10 - (sum % 10)) % 10;
    }

    private String generateCvv() {
        return String.format("%03d", RANDOM.nextInt(1000));
    }

    private String generateExpiry() {
        LocalDate exp = LocalDate.now().plusYears(5);
        return exp.format(DateTimeFormatter.ofPattern("MM/yy"));
    }
}
