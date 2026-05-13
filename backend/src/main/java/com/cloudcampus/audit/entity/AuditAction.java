package com.cloudcampus.audit.entity;

/**
 * Canonical event types written to the audit_log table.
 *
 * Naming convention: {CATEGORY}_{VERB}
 *
 * Category prefix matches the audit_log.category column values:
 *   AUTH, TENANT, PERMISSION, FINANCE, CONFIG, SECURITY, DATA, SYSTEM
 *
 * Only AUTH events are implemented in Phase A.
 * All other categories are declared here so that callers across the codebase
 * use a single source of truth rather than raw strings.
 */
public enum AuditAction {

    // ── AUTH ──────────────────────────────────────────────────────────────
    AUTH_LOGIN_SUCCESS,
    AUTH_LOGIN_FAILED,
    AUTH_LOGIN_BLOCKED,          // rate-limit triggered
    AUTH_LOGOUT,
    AUTH_TOKEN_REFRESHED,
    AUTH_TOKEN_REFRESH_FAILED,
    AUTH_PASSWORD_CHANGED,
    AUTH_PASSWORD_RESET_REQUESTED,

    // ── TENANT ────────────────────────────────────────────────────────────
    TENANT_CREATED,
    TENANT_SUSPENDED,
    TENANT_ARCHIVED,
    TENANT_REACTIVATED,

    // ── PERMISSION ────────────────────────────────────────────────────────
    PERMISSION_ROLE_ASSIGNED,
    PERMISSION_ROLE_REVOKED,

    // ── SECURITY ──────────────────────────────────────────────────────────
    SECURITY_MFA_ENROLLED,
    SECURITY_SUSPICIOUS_ACCESS,

    // ── CONFIG ────────────────────────────────────────────────────────────
    CONFIG_FEATURE_ENABLED,
    CONFIG_FEATURE_DISABLED,

    // ── SYSTEM ────────────────────────────────────────────────────────────
    SYSTEM_BOOTSTRAP,
    SYSTEM_SCHEDULED_JOB
}
