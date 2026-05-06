package com.cloudcampus.cms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "website_config", schema = "public")
public class WebsiteConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, unique = true, length = 50)
    private String tenantId;

    @Column(name = "school_tagline", length = 255)
    private String schoolTagline;

    @Column(name = "school_email", length = 150)
    private String schoolEmail;

    @Column(name = "school_phone", length = 50)
    private String schoolPhone;

    @Column(name = "school_address", columnDefinition = "TEXT")
    private String schoolAddress;

    @Column(name = "school_city", length = 100)
    private String schoolCity;

    @Column(name = "school_state", length = 100)
    private String schoolState;

    @Column(name = "school_country", length = 100)
    private String schoolCountry = "India";

    @Column(name = "school_pincode", length = 20)
    private String schoolPincode;

    @Column(name = "hero_image_url", length = 500)
    private String heroImageUrl;

    @Column(name = "about_text", columnDefinition = "TEXT")
    private String aboutText;

    @Column(name = "vision_text", columnDefinition = "TEXT")
    private String visionText;

    @Column(name = "mission_text", columnDefinition = "TEXT")
    private String missionText;

    @Column(name = "facebook_url", length = 500)
    private String facebookUrl;

    @Column(name = "twitter_url", length = 500)
    private String twitterUrl;

    @Column(name = "instagram_url", length = 500)
    private String instagramUrl;

    @Column(name = "youtube_url", length = 500)
    private String youtubeUrl;

    @Column(name = "admissions_open", nullable = false)
    private boolean admissionsOpen = false;

    @Column(name = "admission_info", columnDefinition = "TEXT")
    private String admissionInfo;

    @Column(name = "theme_color", length = 20)
    private String themeColor = "#10b981";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
