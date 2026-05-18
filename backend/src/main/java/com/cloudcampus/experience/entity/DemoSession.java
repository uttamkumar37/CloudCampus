package com.cloudcampus.experience.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_demo_sessions")
public class DemoSession {

    @Id private UUID id;

    @Column(name = "scenario_id", nullable = false)
    private UUID scenarioId;

    @Column(name = "visitor_token", nullable = false, unique = true, length = 128)
    private String visitorToken;

    @Column(name = "visitor_email", length = 255)
    private String visitorEmail;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "visitor_meta", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> visitorMeta;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "demo_username", length = 255)
    private String demoUsername;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected DemoSession() {}

    public static DemoSession create(UUID scenarioId, String visitorToken, String email,
                                     Map<String, Object> meta, UUID tenantId,
                                     String demoUsername, Instant expiresAt) {
        DemoSession s = new DemoSession();
        s.scenarioId   = scenarioId;
        s.visitorToken = visitorToken;
        s.visitorEmail = email;
        s.visitorMeta  = meta;
        s.tenantId     = tenantId;
        s.demoUsername = demoUsername;
        s.status       = "ACTIVE";
        s.expiresAt    = expiresAt;
        return s;
    }

    @PrePersist void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public void expire() { this.status = "EXPIRED"; }
    public void markCleanedUp() { this.status = "CLEANED_UP"; }

    public UUID                getId()           { return id; }
    public UUID                getScenarioId()   { return scenarioId; }
    public String              getVisitorToken() { return visitorToken; }
    public String              getVisitorEmail() { return visitorEmail; }
    public Map<String, Object> getVisitorMeta()  { return visitorMeta; }
    public UUID                getTenantId()     { return tenantId; }
    public String              getDemoUsername() { return demoUsername; }
    public String              getStatus()       { return status; }
    public Instant             getExpiresAt()    { return expiresAt; }
    public Instant             getCreatedAt()    { return createdAt; }
}
