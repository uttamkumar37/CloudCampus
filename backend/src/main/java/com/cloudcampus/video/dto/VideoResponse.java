package com.cloudcampus.video.dto;

import com.cloudcampus.video.entity.VideoResource;
import com.cloudcampus.video.entity.VideoUploadStatus;
import com.cloudcampus.video.entity.VideoVisibility;

import java.time.Instant;
import java.util.UUID;

public record VideoResponse(
        UUID              id,
        UUID              staffId,
        UUID              subjectId,
        UUID              classId,
        String            title,
        String            description,
        VideoUploadStatus uploadStatus,
        VideoVisibility   visibility,
        String            contentType,
        Long              fileSizeBytes,
        Integer           durationSeconds,
        long              viewCount,
        String            streamUrl,
        String            thumbnailUrl,
        Instant           createdAt
) {
    public static VideoResponse from(VideoResource vr, String streamUrl, String thumbnailUrl) {
        return new VideoResponse(
                vr.getId(), vr.getStaffId(), vr.getSubjectId(), vr.getClassId(),
                vr.getTitle(), vr.getDescription(), vr.getUploadStatus(), vr.getVisibility(),
                vr.getContentType(), vr.getFileSizeBytes(), vr.getDurationSeconds(),
                vr.getViewCount(), streamUrl, thumbnailUrl, vr.getCreatedAt()
        );
    }
}
