package com.cloudcampus.intelligence.ai;

import java.time.Instant;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.platform.tenant.Tenant;
import com.cloudcampus.school.School;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "ai_knowledge_documents")
public class AiKnowledgeDocument {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_id")
    private School school;

    @Column(nullable = false, length = 180)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private AiFeature category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 500)
    private String visibleToRoles;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private AiKnowledgeDocumentStatus status = AiKnowledgeDocumentStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id")
    private UserAccount createdBy;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected AiKnowledgeDocument() {
    }

    public AiKnowledgeDocument(
            School school,
            String title,
            AiFeature category,
            String content,
            Set<UserRole> visibleToRoles,
            UserAccount createdBy
    ) {
        this.tenant = school.getTenant();
        this.school = school;
        this.title = title.trim();
        this.category = category;
        this.content = content.trim();
        this.visibleToRoles = serializeRoles(visibleToRoles);
        this.createdBy = createdBy;
    }

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public School getSchool() {
        return school;
    }

    public String getTitle() {
        return title;
    }

    public AiFeature getCategory() {
        return category;
    }

    public String getContent() {
        return content;
    }

    public Set<UserRole> getVisibleToRoles() {
        if (visibleToRoles == null || visibleToRoles.isBlank()) {
            return EnumSet.noneOf(UserRole.class);
        }
        return Arrays.stream(visibleToRoles.split(","))
                .filter(value -> !value.isBlank())
                .map(UserRole::valueOf)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(UserRole.class)));
    }

    public AiKnowledgeDocumentStatus getStatus() {
        return status;
    }

    public UserAccount getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    private String serializeRoles(Set<UserRole> roles) {
        if (roles == null || roles.isEmpty()) {
            return "";
        }
        return roles.stream()
                .map(UserRole::name)
                .sorted()
                .collect(Collectors.joining(","));
    }
}
