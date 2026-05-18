package com.cloudcampus.experience.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "platform_story_scenes")
public class StoryScene {

    @Id
    private UUID id;

    @Column(name = "scene_key", nullable = false, unique = true, length = 120)
    private String sceneKey;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "audience_type", nullable = false, length = 60)
    private String audienceType;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "timeline_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> timelineJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "proof_points_json", columnDefinition = "jsonb", nullable = false)
    private List<Object> proofPointsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "animation_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> animationJson;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected StoryScene() {}

    public static StoryScene create(String sceneKey,
                                    String title,
                                    String audienceType,
                                    Map<String, Object> timelineJson,
                                    List<Object> proofPointsJson,
                                    Map<String, Object> animationJson,
                                    UUID createdBy) {
        StoryScene scene = new StoryScene();
        scene.sceneKey = sceneKey;
        scene.title = title;
        scene.audienceType = audienceType;
        scene.timelineJson = timelineJson;
        scene.proofPointsJson = proofPointsJson;
        scene.animationJson = animationJson;
        scene.status = "DRAFT";
        scene.published = false;
        scene.createdBy = createdBy;
        return scene;
    }

    @PrePersist
    void onPersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public void update(String title,
                       String audienceType,
                       Map<String, Object> timelineJson,
                       List<Object> proofPointsJson,
                       Map<String, Object> animationJson) {
        this.title = title;
        this.audienceType = audienceType;
        this.timelineJson = timelineJson;
        this.proofPointsJson = proofPointsJson;
        this.animationJson = animationJson;
        this.status = "DRAFT";
        this.published = false;
        this.publishedAt = null;
    }

    public void publish() {
        this.status = "PUBLISHED";
        this.published = true;
        this.publishedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getSceneKey() { return sceneKey; }
    public String getTitle() { return title; }
    public String getAudienceType() { return audienceType; }
    public String getStatus() { return status; }
    public Map<String, Object> getTimelineJson() { return timelineJson; }
    public List<Object> getProofPointsJson() { return proofPointsJson; }
    public Map<String, Object> getAnimationJson() { return animationJson; }
    public boolean isPublished() { return published; }
    public Instant getPublishedAt() { return publishedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
