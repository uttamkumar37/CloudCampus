package com.cloudcampus.audit.service;

import com.cloudcampus.audit.entity.AuditAction;
import com.cloudcampus.audit.entity.AuditLog;
import com.cloudcampus.audit.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Fire-and-forget audit writer (CC-1802 / A5).
 *
 * All methods are annotated @Async — they execute on the shared async thread pool
 * (configured in AsyncConfig) and do NOT block the caller's HTTP thread.
 *
 * Transaction design:
 *   - REQUIRES_NEW: each write runs in its own transaction so that a failure to
 *     persist an audit log entry does NOT roll back the parent business transaction.
 *     e.g. a successful login still returns 200 even if the audit write fails.
 *   - Failures are swallowed after logging — audit failures must never surface to the user.
 *
 * Callers should use the specific helper methods (logLoginSuccess, logLoginFailed, etc.)
 * rather than calling persist() directly.
 */
@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository repository;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    // ── Auth events ──────────────────────────────────────────────────────────

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLoginSuccess(UUID userId, UUID tenantId, String username, String ipAddress) {
        persist(AuditLog.builder()
                .actorId(userId)
                .tenantId(tenantId)
                .actorUsername(username)
                .eventType(AuditAction.AUTH_LOGIN_SUCCESS)
                .description("Successful login")
                .ipAddress(ipAddress)
                .build());
    }

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLoginFailed(String username, String ipAddress, String reason) {
        persist(AuditLog.builder()
                .actorUsername(username)
                .eventType(AuditAction.AUTH_LOGIN_FAILED)
                .description("Login failed: " + reason)
                .ipAddress(ipAddress)
                .metadata(Map.of("reason", reason))
                .build());
    }

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLoginBlocked(String username, String ipAddress) {
        persist(AuditLog.builder()
                .actorUsername(username)
                .eventType(AuditAction.AUTH_LOGIN_BLOCKED)
                .description("Login blocked by rate limiter")
                .ipAddress(ipAddress)
                .build());
    }

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLogout(UUID userId, UUID tenantId, String username) {
        persist(AuditLog.builder()
                .actorId(userId)
                .tenantId(tenantId)
                .actorUsername(username)
                .eventType(AuditAction.AUTH_LOGOUT)
                .description("User logged out")
                .build());
    }

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logTokenRefreshed(UUID userId, UUID tenantId) {
        persist(AuditLog.builder()
                .actorId(userId)
                .tenantId(tenantId)
                .eventType(AuditAction.AUTH_TOKEN_REFRESHED)
                .description("Access token refreshed")
                .build());
    }

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logTokenRefreshFailed(String reason) {
        persist(AuditLog.builder()
                .eventType(AuditAction.AUTH_TOKEN_REFRESH_FAILED)
                .description("Token refresh failed: " + reason)
                .build());
    }

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAccountLocked(UUID userId, UUID tenantId, String username, String ipAddress) {
        persist(AuditLog.builder()
                .actorId(userId)
                .tenantId(tenantId)
                .actorUsername(username)
                .eventType(AuditAction.AUTH_ACCOUNT_LOCKED)
                .description("Account suspended after repeated failed login attempts")
                .ipAddress(ipAddress)
                .build());
    }

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPasswordChanged(UUID userId, UUID tenantId) {
        persist(AuditLog.builder()
                .actorId(userId)
                .tenantId(tenantId)
                .eventType(AuditAction.AUTH_PASSWORD_CHANGED)
                .description("Password changed by user")
                .build());
    }

    // ── Tenant events ────────────────────────────────────────────────────────

    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logTenantCreated(UUID actorId, String actorUsername, UUID tenantId, String tenantName) {
        persist(AuditLog.builder()
                .actorId(actorId)
                .actorUsername(actorUsername)
                .eventType(AuditAction.TENANT_CREATED)
                .resourceType("Tenant")
                .resourceId(tenantId.toString())
                .description("Tenant created: " + tenantName)
                .build());
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    /**
     * Persist a single audit log entry.
     *
     * Exceptions are caught and logged at ERROR level but NEVER re-thrown.
     * Audit failures must not disrupt the calling business operation.
     */
    private void persist(AuditLog entry) {
        try {
            repository.save(entry);
        } catch (Exception ex) {
            // Log with correlation id if available. Do not re-throw.
            log.error("Failed to persist audit log entry [eventType={}]: {}",
                    entry.getEventType(), ex.getMessage(), ex);
        }
    }
}
