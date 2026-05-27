package com.cloudcampus.notification;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "notification_deliveries")
public class NotificationDelivery {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    @Column(name = "school_id", length = 36)
    private String schoolId;

    @Column(name = "invitation_id", length = 36)
    private String invitationId;

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(nullable = false, length = 32)
    private String channel;

    @Column(nullable = false, length = 80)
    private String template;

    @Column(name = "recipient_email", nullable = false, length = 320)
    private String recipientEmail;

    @Column(name = "recipient_name", nullable = false, length = 160)
    private String recipientName;

    @Column(name = "recipient_role", nullable = false, length = 40)
    private String recipientRole;

    @Column(nullable = false, length = 240)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private NotificationDeliveryStatus status = NotificationDeliveryStatus.PENDING;

    @Column(length = 80)
    private String provider;

    @Column(name = "masked_recipient", nullable = false, length = 340)
    private String maskedRecipient;

    @Column(name = "last_error", length = 1000)
    private String lastError;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "failed_at")
    private Instant failedAt;

    protected NotificationDelivery() {
    }

    public NotificationDelivery(
            String tenantId,
            String schoolId,
            String invitationId,
            String userId,
            String channel,
            String template,
            String recipientEmail,
            String recipientName,
            String recipientRole,
            String subject,
            String maskedRecipient
    ) {
        this.tenantId = tenantId;
        this.schoolId = schoolId;
        this.invitationId = invitationId;
        this.userId = userId;
        this.channel = channel;
        this.template = template;
        this.recipientEmail = recipientEmail;
        this.recipientName = recipientName;
        this.recipientRole = recipientRole;
        this.subject = subject;
        this.maskedRecipient = maskedRecipient;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public void markSent(String provider, Instant sentAt) {
        this.status = NotificationDeliveryStatus.SENT;
        this.provider = provider;
        this.sentAt = sentAt;
        this.failedAt = null;
        this.lastError = null;
    }

    public void markLogged(String provider, Instant loggedAt) {
        this.status = NotificationDeliveryStatus.LOGGED;
        this.provider = provider;
        this.sentAt = loggedAt;
        this.failedAt = null;
        this.lastError = null;
    }

    public void markDisabled(String provider, Instant disabledAt) {
        this.status = NotificationDeliveryStatus.DISABLED;
        this.provider = provider;
        this.sentAt = disabledAt;
        this.failedAt = null;
        this.lastError = null;
    }

    public void markFailed(String provider, String lastError, Instant failedAt) {
        this.status = NotificationDeliveryStatus.FAILED;
        this.provider = provider;
        this.failedAt = failedAt;
        this.lastError = abbreviate(lastError);
    }

    private String abbreviate(String value) {
        if (value == null || value.length() <= 1000) {
            return value;
        }
        return value.substring(0, 1000);
    }

    public String getId() {
        return id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public String getSchoolId() {
        return schoolId;
    }

    public String getInvitationId() {
        return invitationId;
    }

    public String getUserId() {
        return userId;
    }

    public String getChannel() {
        return channel;
    }

    public String getTemplate() {
        return template;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public String getRecipientRole() {
        return recipientRole;
    }

    public String getSubject() {
        return subject;
    }

    public NotificationDeliveryStatus getStatus() {
        return status;
    }

    public String getProvider() {
        return provider;
    }

    public String getMaskedRecipient() {
        return maskedRecipient;
    }

    public String getLastError() {
        return lastError;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public Instant getFailedAt() {
        return failedAt;
    }
}
