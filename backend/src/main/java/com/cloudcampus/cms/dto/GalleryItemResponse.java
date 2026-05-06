package com.cloudcampus.cms.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class GalleryItemResponse {
    private UUID id;
    private String tenantId;
    private String imageUrl;
    private String caption;
    private int displayOrder;
    private boolean visible;
    private Instant createdAt;
}
