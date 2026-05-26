package com.cloudcampus.audit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    List<AuditLog> findByTenantId(String tenantId);
}
