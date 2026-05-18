package com.cloudcampus.experience.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_investor_rooms")
public class InvestorRoom {

    @Id private UUID id;

    @Column(name = "room_code", nullable = false, unique = true, length = 40)
    private String roomCode;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "access_mode", nullable = false, length = 20)
    private String accessMode;

    @Column(name = "access_secret", length = 255)
    private String accessSecret;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> contentJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "branding_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> brandingJson;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected InvestorRoom() {}

    public static InvestorRoom create(String roomCode, String title, String accessMode, UUID createdBy) {
        InvestorRoom r = new InvestorRoom();
        r.roomCode     = roomCode;
        r.title        = title;
        r.accessMode   = accessMode;
        r.status       = "ACTIVE";
        r.contentJson  = Map.of();
        r.brandingJson = Map.of();
        r.createdBy    = createdBy;
        return r;
    }

    @PrePersist void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public void setAccessSecret(String secret) { this.accessSecret = secret; }
    public void setContentJson(Map<String, Object> c) { this.contentJson = c; }
    public void setBrandingJson(Map<String, Object> b) { this.brandingJson = b; }
    public void setExpiresAt(Instant t) { this.expiresAt = t; }
    public void archive() { this.status = "ARCHIVED"; }

    public UUID                getId()           { return id; }
    public String              getRoomCode()     { return roomCode; }
    public String              getTitle()        { return title; }
    public String              getAccessMode()   { return accessMode; }
    public String              getAccessSecret() { return accessSecret; }
    public Instant             getExpiresAt()    { return expiresAt; }
    public Map<String, Object> getContentJson()  { return contentJson; }
    public Map<String, Object> getBrandingJson() { return brandingJson; }
    public String              getStatus()       { return status; }
    public UUID                getCreatedBy()    { return createdBy; }
    public Instant             getCreatedAt()    { return createdAt; }
    public Instant             getUpdatedAt()    { return updatedAt; }
}
