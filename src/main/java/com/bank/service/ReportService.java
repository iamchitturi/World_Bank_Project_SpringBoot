package com.bank.service;

import com.bank.repository.ReportRepository;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Enterprise report service backed by Redis distributed cache.
 * Aggregated metrics are cached and refreshed periodically.
 */
@Service
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);
    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Scheduled(fixedRateString = "${app.report.cache-refresh-ms:300000}") // 5 min default
    @CacheEvict(value = "reports", allEntries = true)
    public void refreshCache() {
        log.info("Evicting enterprise report caches — next read will repopulate from DB");
    }

    @Cacheable(value = "reports", key = "'totalBalance'")
    public BigDecimal totalBalance() {
        log.debug("Cache MISS for totalBalance — querying database");
        return reportRepository.totalBalance();
    }

    @Cacheable(value = "reports", key = "'totalTransactionVolume'")
    public BigDecimal totalTransactionVolume() {
        log.debug("Cache MISS for totalTransactionVolume — querying database");
        return reportRepository.totalTransactionVolume();
    }

    @Cacheable(value = "reports", key = "'activeAccountsCount'")
    public Long activeAccountsCount() {
        log.debug("Cache MISS for activeAccountsCount — querying database");
        return reportRepository.activeAccountsCount();
    }
}
