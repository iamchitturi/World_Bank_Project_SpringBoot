package com.bank.controller;

import com.bank.api.ApiResponse;
import com.bank.dto.CreateCardDTO;
import com.bank.entity.Card;
import com.bank.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cards")
@Tag(name = "Cards", description = "Manage debit and credit cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping("/issue")
    @Operation(summary = "Issue a new card", description = "Issue a debit or credit card linked to an account")
    public ApiResponse<Card> issueCard(@Valid @RequestBody CreateCardDTO dto) {
        return ok(cardService.issueCard(dto), "Card issued");
    }

    @GetMapping("/my")
    @Operation(summary = "My cards", description = "Get all cards across all of the user's accounts")
    public ApiResponse<List<Card>> getMyCards() {
        return ok(cardService.getMyCards(), "Cards fetched");
    }

    @GetMapping("/account/{accountId}")
    @Operation(summary = "Cards by account", description = "Get all cards for a specific account")
    public ApiResponse<List<Card>> getCardsByAccount(@PathVariable Long accountId) {
        return ok(cardService.getCardsByAccount(accountId), "Cards fetched");
    }

    @PostMapping("/block/{cardId}")
    @Operation(summary = "Block card")
    public ApiResponse<Card> blockCard(@PathVariable Long cardId) {
        return ok(cardService.blockCard(cardId), "Card blocked");
    }

    @PostMapping("/activate/{cardId}")
    @Operation(summary = "Activate card")
    public ApiResponse<Card> activateCard(@PathVariable Long cardId) {
        return ok(cardService.activateCard(cardId), "Card activated");
    }

    private <T> ApiResponse<T> ok(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true).message(message).data(data).timestamp(LocalDateTime.now()).build();
    }
}
