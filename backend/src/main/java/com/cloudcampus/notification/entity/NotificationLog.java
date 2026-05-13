package com.cloudcampus.notification.entity;

import com.cloudcampus.common.tenant.TenantFilter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;

import java.time.Instant;
import java.util.UUID;

/**
 * Audit record for every notification dispatch attempt.
 *
 * One row is created per dispatch, regardless of success or failure.
 * Allows school admins to view what was sent, to whom, and whether it succeeded.
 *
 * Maps to {@code notification_logs} (V25__create_notification_logs.sql).
 *
 * Tenant isolation: {@link TenantFilter} is applied by {@code TenantFilterAspect}
 * before any repository query, restricting rows to the current tenant.
 */
@Entity
@Table(name = "notification_logs")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class NotificationLog {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", updatable = false)
    private UUID schoolId;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, updatable = false, length = 20)
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_code", updatable = false, length = 100)
    private NotificationTemplateCode templateCode;

    /** Destination address — email address or E.164 phone number. */
    @Column(name = "recipient", nullable = false, updatable = false, length = 255)
    private String recipient;

    /** Email subject; null for SMS. */
    @Column(name = "subject", updatable = false, length = 500)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private NotificationStatus status;

    /** Non-null only when status = FAILED. Truncated to 2 000 chars before persist. */
    @Column(name = "error_message", length = 2000)
    private String errorMessage;

    /** Set when status transitions to SENT. */
    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // ── Lifecycle ────────────────────────────────────────────────────────────

    protected NotificationLog() {}

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = Instant.now();
    }

    // ── Factory ──────────────────────────────────────────────────────────────

    /**
     * Creates a QUEUED log entry before the dispatch is attempted.
     * Call {@link #markSent()} or {@link #markFailed(String)} after dispatch.
     */
    public static NotificationLog create(UUID tenantId, UUID schoolId,
                                         NotificationChannel channel,
                                         NotificationTemplateCode templateCode,
                                         String recipient, String subject) {
        NotificationLog entry = new NotificationLog();
        entry.tenantId     = tenantId;
        entry.schoolId     = schoolId;
        entry.channel      = channel;
        entry.templateCode = templateCode;
        entry.recipient    = recipient;
        entry.subject      = subject;
        entry.status       = NotificationStatus.QUEUED;
        return entry;
    }

    // ── Behaviour ────────────────────────────────────────────────────────────

    public void markSent() {
        this.status  = NotificationStatus.SENT;
        this.sentAt  = Instant.now();
    }

    public void markFailed(String errorMessage) {
        this.status       = NotificationStatus.FAILED;
        // Guard against oversized error messages (column limit 2 000 chars)
        this.errorMessage = errorMessage != null && errorMessage.length() > 2000
                ? errorMessage.substring(0, 2000)
                : errorMessage;
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    public UUID                   getId()           { return id; }
    public UUID                   getTenantId()     { return tenantId; }
    public UUID                   getSchoolId()     { return schoolId; }
    public NotificationChannel    getChannel()      { return channel; }
    public NotificationTemplateCode getTemplateCode() { return templateCode; }
    public String                 getRecipient()    { return recipient; }
    public String                 getSubject()      { return subject; }
    public NotificationStatus     getStatus()       { return status; }
    public String                 getErrorMessage() { return errorMessage; }
    public Instant                getSentAt()       { return sentAt; }
    public Instant                getCreatedAt()    { return createdAt; }
}
