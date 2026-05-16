package com.cloudcampus.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "device_sessions")
public class DeviceSession {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "device_name", nullable = false, length = 255)
    private String deviceName;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "user_agent", nullable = false, length = 512)
    private String userAgent;

    @Column(name = "last_seen_at", nullable = false)
    private Instant lastSeenAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "revoked", nullable = false)
    private boolean revoked = false;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    protected DeviceSession() {}

    public static DeviceSession create(UUID userId, UUID tenantId,
                                       String deviceName, String ipAddress, String userAgent) {
        DeviceSession ds = new DeviceSession();
        ds.userId     = userId;
        ds.tenantId   = tenantId;
        ds.deviceName = deviceName;
        ds.ipAddress  = ipAddress;
        ds.userAgent  = userAgent;
        return ds;
    }

    @PrePersist
    void onPersist() {
        if (id == null)         id          = UUID.randomUUID();
        if (createdAt == null)  createdAt   = Instant.now();
        if (lastSeenAt == null) lastSeenAt  = createdAt;
    }

    public void revoke() {
        this.revoked   = true;
        this.revokedAt = Instant.now();
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    public UUID    getId()         { return id; }
    public UUID    getUserId()     { return userId; }
    public UUID    getTenantId()   { return tenantId; }
    public String  getDeviceName() { return deviceName; }
    public String  getIpAddress()  { return ipAddress; }
    public String  getUserAgent()  { return userAgent; }
    public Instant getLastSeenAt() { return lastSeenAt; }
    public Instant getCreatedAt()  { return createdAt; }
    public boolean isRevoked()     { return revoked; }
    public Instant getRevokedAt()  { return revokedAt; }
}
