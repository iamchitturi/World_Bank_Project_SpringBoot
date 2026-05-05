package com.bank.service;

import com.bank.repository.ReportRepository;
import java.math.BigDecimal;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);
    private final ReportRepository reportRepository;
    
    private final AtomicReference<BigDecimal> cachedTotalBalance = new AtomicReference<>(BigDecimal.ZERO);
    private final AtomicReference<BigDecimal> cachedTotalVolume = new AtomicReference<>(BigDecimal.ZERO);
    private final AtomicReference<Long> cachedActiveAccounts = new AtomicReference<>(0L);

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @PostConstruct
    @Scheduled(fixedRateString = "${app.report.cache-refresh-ms:300000}") // 5 minutes default
    public void refreshCache() {
        log.info("Refreshing enterprise report caches from database...");
        cachedTotalBalance.set(reportRepository.totalBalance());
        cachedTotalVolume.set(reportRepository.totalTransactionVolume());
        cachedActiveAccounts.set(reportRepository.activeAccountsCount());
    }

    public BigDecimal totalBalance() {
        return cachedTotalBalance.get();
    }

    public BigDecimal totalTransactionVolume() {
        return cachedTotalVolume.get();
    }

    public Long activeAccountsCount() {
        return cachedActiveAccounts.get();
    }
}

