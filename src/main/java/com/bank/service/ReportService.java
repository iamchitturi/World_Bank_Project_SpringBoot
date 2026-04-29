package com.bank.service;

import com.bank.repository.ReportRepository;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public BigDecimal totalBalance() {
        return reportRepository.totalBalance();
    }
}

