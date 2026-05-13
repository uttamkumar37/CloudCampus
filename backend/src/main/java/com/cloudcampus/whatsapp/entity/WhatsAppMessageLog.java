package com.cloudcampus.whatsapp.entity;

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
 * Audit record for every WhatsApp Business API outbound message attempt (CC-1004 / E14).
 *
 * One row per dispatch. Allows school admins to track what was sent, to whom,
 * and whether it succeeded.
 *
 * Tenant isolation: {@link TenantFilter} applied by {@code TenantFilterAspect}.
 * Maps to {@code whatsapp_message_logs} (V26__create_whatsapp_message_logs.sql).
 */
@Entity
@Table(name = "whatsapp_message_logs")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class WhatsAppMessageLog {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "school_id", updatable = false)
    private UUID schoolId;

    /** Destination phone number in E.164 format (+91XXXXXXXXXX). */
    @Column(name = "recipient", nullable = false, updatable = false, length = 30)
    private String recipient;

    /** Template name registered in WhatsApp Business Manager. */
    @Column(name = "template_name", nullable = false, updatable = false, length = 100)
    private String templateName;

    /** BCP-47 language code (e.g. en, en_US, en_IN, hi). */
    @Column(name = "language_code", nullable = false, length = 20)
    private String languageCode = "en";

    /**
     * JSON-serialised ordered list of template variable values.
     * e.g. {@code ["John Doe","Rs 5000","01 Jun 2025"]}
     * Stored as text — no JPA conversion needed; passed through to the API.
     */
    @Column(name = "template_params", columnDefinition = "text")
    private String templateParams;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private WhatsAppStatus status;

    @Column(name = "error_message", length = 2000)
    private String errorMessage;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    protected WhatsAppMessageLog() {}

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        createdAt = Instant.now();
    }

    // ── Factory ───────────────────────────────────────────────────────────────

    public static WhatsAppMessageLog create(UUID tenantId, UUID schoolId,
                                             String recipient, String templateName,
                                             String languageCode, String templateParams) {
        WhatsAppMessageLog log = new WhatsAppMessageLog();
        log.tenantId       = tenantId;
        log.schoolId       = schoolId;
        log.recipient      = recipient;
        log.templateName   = templateName;
        log.languageCode   = (languageCode != null && !languageCode.isBlank()) ? languageCode : "en";
        log.templateParams = templateParams;
        log.status         = WhatsAppStatus.QUEUED;
        return log;
    }

    // ── Behaviour ─────────────────────────────────────────────────────────────

    public void markSent() {
        this.status = WhatsAppStatus.SENT;
        this.sentAt = Instant.now();
    }

    public void markFailed(String message) {
        this.status       = WhatsAppStatus.FAILED;
        this.errorMessage = (message != null && message.length() > 2000)
                ? message.substring(0, 2000)
                : message;
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public UUID           getId()             { return id; }
    public UUID           getTenantId()       { return tenantId; }
    public UUID           getSchoolId()       { return schoolId; }
    public String         getRecipient()      { return recipient; }
    public String         getTemplateName()   { return templateName; }
    public String         getLanguageCode()   { return languageCode; }
    public String         getTemplateParams() { return templateParams; }
    public WhatsAppStatus getStatus()         { return status; }
    public String         getErrorMessage()   { return errorMessage; }
    public Instant        getSentAt()         { return sentAt; }
    public Instant        getCreatedAt()      { return createdAt; }
}
