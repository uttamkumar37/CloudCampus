package com.cloudcampus.audit.repository;

import com.cloudcampus.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Audit log repository — append-only.
 *
 * Never call delete* or any mutation method on this repository.
 * Archival / retention is a scheduled background job (CC-1802).
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
}
