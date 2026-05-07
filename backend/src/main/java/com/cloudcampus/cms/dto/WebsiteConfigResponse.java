package com.cloudcampus.cms.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class WebsiteConfigResponse {
    private UUID id;
    private String tenantId;
    private String schoolTagline;
    private String schoolEmail;
    private String schoolPhone;
    private String schoolAddress;
    private String schoolCity;
    private String schoolState;
    private String schoolCountry;
    private String schoolPincode;
    private String heroImageUrl;
    private String aboutText;
    private String visionText;
    private String missionText;
    private String facebookUrl;
    private String twitterUrl;
    private String instagramUrl;
    private String youtubeUrl;
    private boolean admissionsOpen;
    private String admissionInfo;
    private String themeColor;
    private String logoUrl;
    private Integer schoolEstablishedYear;
    private String affiliationBoard;
    private String mediumOfInstruction;
    private String schoolType;
    private Integer studentCount;
    private Integer teacherCount;
    private String heroCtaText;
    private String heroCtaLink;
    private String achievementBadge;
    private String noticesText;
    private Instant updatedAt;
}
