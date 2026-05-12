package com.cloudcampus.notice.dto;

import com.cloudcampus.notice.entity.NoticeCategory;
import com.cloudcampus.notice.entity.NoticeTarget;
import com.cloudcampus.notice.entity.SchoolNotice;

import java.time.Instant;
import java.util.UUID;

public record NoticeResponse(
        UUID           id,
        UUID           schoolId,
        String         title,
        String         content,
        NoticeCategory category,
        NoticeTarget   target,
        int            priority,
        boolean        published,
        Instant        publishedAt,
        Instant        expiresAt,
        UUID           postedBy,
        Instant        createdAt
) {
    public static NoticeResponse from(SchoolNotice n) {
        return new NoticeResponse(
                n.getId(), n.getSchoolId(), n.getTitle(), n.getContent(),
                n.getCategory(), n.getTarget(), n.getPriority(),
                n.isPublished(), n.getPublishedAt(), n.getExpiresAt(),
                n.getPostedBy(), n.getCreatedAt());
    }
}
