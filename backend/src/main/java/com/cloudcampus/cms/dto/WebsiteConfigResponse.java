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
    private Instant updatedAt;
}
