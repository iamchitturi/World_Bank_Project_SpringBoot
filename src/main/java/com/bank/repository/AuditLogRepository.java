package com.bank.repository;

import com.bank.entity.AuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findTop50ByOrderByTimestampDesc();

    List<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy);
}
