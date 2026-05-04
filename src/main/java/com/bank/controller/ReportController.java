package com.bank.controller;

import com.bank.api.ApiResponse;
import com.bank.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports", description = "Banking reports and analytics")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/total-balance")
    @Operation(summary = "Total balance", description = "Get the sum of all account balances in the system")
    public ApiResponse<Map<String, BigDecimal>> totalBalance() {
        return ApiResponse.<Map<String, BigDecimal>>builder()
                .success(true)
                .message("Total balance report")
                .data(Map.of("totalBalance", reportService.totalBalance()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/transaction-volume")
    @Operation(summary = "Total transaction volume", description = "Get the sum of all transaction amounts in the system")
    public ApiResponse<Map<String, BigDecimal>> transactionVolume() {
        return ApiResponse.<Map<String, BigDecimal>>builder()
                .success(true)
                .message("Total transaction volume report")
                .data(Map.of("totalVolume", reportService.totalTransactionVolume()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @GetMapping("/active-accounts")
    @Operation(summary = "Active accounts count", description = "Get the number of active accounts")
    public ApiResponse<Map<String, Long>> activeAccounts() {
        return ApiResponse.<Map<String, Long>>builder()
                .success(true)
                .message("Active accounts report")
                .data(Map.of("activeAccounts", reportService.activeAccountsCount()))
                .timestamp(LocalDateTime.now())
                .build();
    }
}

