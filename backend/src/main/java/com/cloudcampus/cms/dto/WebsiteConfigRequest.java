package com.cloudcampus.cms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class WebsiteConfigRequest {
    private String schoolTagline;
    @NotBlank
    private String schoolEmail;
    @NotBlank
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
}
