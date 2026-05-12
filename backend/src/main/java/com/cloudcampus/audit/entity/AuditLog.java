package com.cloudcampus.audit.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.cloudcampus.common.tenant.TenantFilter;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Append-only audit log entry.
 *
 * IMPORTANT: This entity must NEVER be updated or deleted via JPA.
 * - No @PreUpdate, no setters that would allow mutation after creation.
 * - Retention / archival is handled by a scheduled background job (CC-1802).
 *
 * Maps to the audit_log table created in V4__create_audit_log.sql.
 *
 * metadata is a JSONB column — stored as Map<String, Object> serialised
 * by Hibernate's JSON type support (requires jackson-databind on classpath,
 * which is provided transitively by spring-boot-starter-web).
 */
@Entity
@Table(name = "audit_log")
@Filter(name = TenantFilter.NAME, condition = TenantFilter.CONDITION)
public class AuditLog {

    @Id
    private UUID id;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_username", length = 200)
    private String actorUsername;

    // Stores the AuditAction enum prefix before the first '_' (e.g. AUTH, TENANT).
    @Column(name = "category", nullable = false, length = 20)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 100)
    private AuditAction eventType;

    @Column(name = "resource_type", length = 100)
    private String resourceType;

    @Column(name = "resource_id", length = 200)
    private String resourceId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @Column(name = "ip_address", length = 45)   // stored as TEXT — INET cast handled in SQL
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AuditLog() {}

    @PrePersist
    void onPersist() {
        if (id == null)        id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        // Derive category from event type name (prefix before first '_').
        if (category == null && eventType != null) {
            String name = eventType.name();
            int idx = name.indexOf('_');
            category = idx > 0 ? name.substring(0, idx) : name;
        }
    }

    // ── Read-only accessors (no setters — entity is immutable after creation) ──

    public UUID    getId()            { return id; }
    public UUID    getTenantId()      { return tenantId; }
    public UUID    getActorId()       { return actorId; }
    public String  getActorUsername() { return actorUsername; }
    public String  getCategory()      { return category; }
    public AuditAction getEventType() { return eventType; }
    public String  getResourceType()  { return resourceType; }
    public String  getResourceId()    { return resourceId; }
    public String  getDescription()   { return description; }
    public Map<String, Object> getMetadata() { return metadata; }
    public String  getIpAddress()     { return ipAddress; }
    public String  getUserAgent()     { return userAgent; }
    public Instant getCreatedAt()     { return createdAt; }

    // ── Builder ──────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private final AuditLog log = new AuditLog();

        public Builder tenantId(UUID v)       { log.tenantId = v;       return this; }
        public Builder actorId(UUID v)        { log.actorId = v;        return this; }
        public Builder actorUsername(String v){ log.actorUsername = v;  return this; }
        public Builder eventType(AuditAction v){ log.eventType = v;     return this; }
        public Builder resourceType(String v) { log.resourceType = v;   return this; }
        public Builder resourceId(String v)   { log.resourceId = v;     return this; }
        public Builder description(String v)  { log.description = v;    return this; }
        public Builder metadata(Map<String, Object> v){ log.metadata = v; return this; }
        public Builder ipAddress(String v)    { log.ipAddress = v;      return this; }
        public Builder userAgent(String v)    { log.userAgent = v;      return this; }

        public AuditLog build() { return log; }
    }
}
