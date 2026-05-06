package com.cloudcampus.cms.dto;

import lombok.Data;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
public class WebsiteSectionResponse {
    private UUID id;
    private String tenantId;
    private String sectionKey;
    private String title;
    private String subtitle;
    private Map<String, Object> bodyJson;
    private int displayOrder;
    private boolean visible;
    private Instant updatedAt;
}
