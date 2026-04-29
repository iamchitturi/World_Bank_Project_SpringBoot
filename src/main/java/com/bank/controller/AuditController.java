package com.bank.controller;

import com.bank.api.ApiResponse;
import com.bank.entity.AuditLog;
import com.bank.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Audit", description = "View audit trail (admin only)")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    public AuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @Operation(summary = "Recent audit logs", description = "Get the 50 most recent audit log entries")
    public ApiResponse<List<AuditLog>> recentLogs() {
        return ApiResponse.<List<AuditLog>>builder()
                .success(true)
                .message("Audit logs fetched")
                .data(auditLogRepository.findTop50ByOrderByTimestampDesc())
                .timestamp(LocalDateTime.now())
                .build();
    }
}
