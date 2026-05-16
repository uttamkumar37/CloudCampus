package com.cloudcampus.website.dto;

import com.cloudcampus.website.entity.Website;

import java.util.UUID;

public record WebsiteResponse(UUID id, UUID schoolId, boolean published) {
    public static WebsiteResponse from(Website w) {
        return new WebsiteResponse(w.getId(), w.getSchoolId(), w.isPublished());
    }
}
