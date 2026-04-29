package com.bank.controller;

import com.bank.api.ApiResponse;
import com.bank.service.ReportService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/total-balance")
    public ApiResponse<Map<String, BigDecimal>> totalBalance() {
        return ApiResponse.<Map<String, BigDecimal>>builder()
                .success(true)
                .message("Total balance report")
                .data(Map.of("totalBalance", reportService.totalBalance()))
                .timestamp(LocalDateTime.now())
                .build();
    }
}

