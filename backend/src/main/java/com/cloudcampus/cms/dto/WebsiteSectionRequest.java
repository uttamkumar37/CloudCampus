package com.cloudcampus.cms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class WebsiteSectionRequest {
    @NotBlank
    private String sectionKey;
    private String title;
    private String subtitle;
    private Map<String, Object> bodyJson;
    private int displayOrder;
    private boolean visible = true;
}
