package com.cloudcampus.cms.dto;

import lombok.Data;

import java.util.List;

/**
 * Full public website payload — returned to anonymous visitors.
 * Contains website config + visible sections + gallery items.
 */
@Data
public class PublicWebsiteResponse {
    private String tenantId;
    private String schoolName;
    private String logoUrl;
    private WebsiteConfigResponse config;
    private List<WebsiteSectionResponse> sections;
    private List<GalleryItemResponse> gallery;
}
