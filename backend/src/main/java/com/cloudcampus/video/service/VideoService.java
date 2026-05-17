package com.cloudcampus.video.service;

import com.cloudcampus.video.dto.VideoResponse;
import com.cloudcampus.video.dto.VideoUploadRequest;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface VideoService {
    /** Returns the video record + a presigned PUT URL for the client to upload directly to MinIO. */
    Map<String, Object> initiateUpload(UUID tenantId, UUID schoolId, UUID staffId, VideoUploadRequest req);
    /** Mark upload as READY after client confirms upload completion. */
    VideoResponse confirmUpload(UUID tenantId, UUID videoId, Long fileSizeBytes, Integer durationSeconds);
    VideoResponse getById(UUID tenantId, UUID videoId);
    void delete(UUID tenantId, UUID videoId);
    List<VideoResponse> listBySchool(UUID schoolId);
    List<VideoResponse> listByStaff(UUID staffId);
    List<VideoResponse> listBySubject(UUID subjectId, UUID tenantId);
}
