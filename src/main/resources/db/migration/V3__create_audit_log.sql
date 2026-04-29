-- Audit log table for tracking all banking operations
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    performed_by VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp DATETIME NOT NULL
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_performed_by ON audit_logs(performed_by);
