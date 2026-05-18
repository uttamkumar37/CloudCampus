package com.cloudcampus.experience.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_demo_scenarios")
public class DemoScenario {

    @Id private UUID id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 120)
    private String slug;

    @Column(name = "description")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "school_profile", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> schoolProfile;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "features_json", columnDefinition = "jsonb", nullable = false)
    private List<String> featuresJson;

    @Column(name = "data_seed_ref", length = 120)
    private String dataSeedRef;

    @Column(name = "session_ttl_min", nullable = false)
    private int sessionTtlMin;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected DemoScenario() {}

    @PrePersist void onPersist() {
        if (id        == null) id        = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = createdAt;
        if (status == null) status = "ACTIVE";
    }

    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public UUID                getId()           { return id; }
    public String              getName()          { return name; }
    public String              getSlug()          { return slug; }
    public String              getDescription()   { return description; }
    public Map<String, Object> getSchoolProfile() { return schoolProfile; }
    public List<String>        getFeaturesJson()  { return featuresJson; }
    public String              getDataSeedRef()   { return dataSeedRef; }
    public int                 getSessionTtlMin() { return sessionTtlMin; }
    public int                 getDisplayOrder()  { return displayOrder; }
    public String              getStatus()        { return status; }
    public Instant             getCreatedAt()     { return createdAt; }
    public Instant             getUpdatedAt()     { return updatedAt; }
}
