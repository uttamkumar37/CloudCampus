package com.cloudcampus.feature.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Platform feature catalog entry (maps to the `features` table created in V3).
 *
 * Lifecycle: Super Admin creates and manages features.
 * Per-tenant enablement is tracked in {@link TenantFeature}.
 */
@Entity
@Table(name = "features")
public class Feature {

    @Id
    @Column(name = "key", nullable = false, length = 100)
    private String key;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private FeatureType type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Feature() {
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    // ── Getters ─────────────────────────────────────────────────────────────

    public String getKey()          { return key; }
    public String getName()         { return name; }
    public FeatureType getType()    { return type; }
    public String getDescription()  { return description; }
    public Instant getCreatedAt()   { return createdAt; }
    public Instant getUpdatedAt()   { return updatedAt; }
}
