package com.cloudcampus.video.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.video.dto.VideoResponse;
import com.cloudcampus.video.dto.VideoUploadRequest;
import com.cloudcampus.video.entity.VideoResource;
import com.cloudcampus.video.entity.VideoVisibility;
import com.cloudcampus.video.repository.VideoResourceRepository;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class VideoServiceImpl implements VideoService {

    private static final Logger log = LoggerFactory.getLogger(VideoServiceImpl.class);
    private static final String BUCKET = "cloudcampus-videos";

    private final VideoResourceRepository repository;
    private final MinioClient             minioClient;

    @Value("${app.minio.public-url:http://localhost:9000}")
    private String minioPublicUrl;

    public VideoServiceImpl(VideoResourceRepository repository, MinioClient minioClient) {
        this.repository  = repository;
        this.minioClient = minioClient;
    }

    @Override
    @Transactional
    public Map<String, Object> initiateUpload(UUID tenantId, UUID schoolId, UUID staffId, VideoUploadRequest req) {
        String ext     = extensionFor(req.contentType());
        String fileKey = "videos/" + tenantId + "/" + UUID.randomUUID() + ext;

        VideoResource vr = VideoResource.create(
                tenantId, schoolId, staffId,
                req.subjectId(), req.classId(),
                req.title(), req.description(),
                fileKey, req.contentType() != null ? req.contentType() : "video/mp4",
                req.visibility() != null ? req.visibility() : VideoVisibility.CLASS
        );
        VideoResource saved = repository.save(vr);

        String uploadUrl = presignedPutUrl(fileKey, req.contentType());
        return Map.of(
                "videoId",   saved.getId(),
                "uploadUrl", uploadUrl,
                "fileKey",   fileKey
        );
    }

    @Override
    @Transactional
    public VideoResponse confirmUpload(UUID tenantId, UUID videoId, Long fileSizeBytes, Integer durationSeconds) {
        VideoResource vr = findOwned(tenantId, videoId);
        vr.markReady(fileSizeBytes != null ? fileSizeBytes : 0L, durationSeconds);
        return toResponse(repository.save(vr));
    }

    @Override
    public VideoResponse getById(UUID tenantId, UUID videoId) {
        return toResponse(findOwned(tenantId, videoId));
    }

    @Override
    @Transactional
    public void delete(UUID tenantId, UUID videoId) {
        VideoResource vr = findOwned(tenantId, videoId);
        tryDeleteFromMinio(vr.getFileKey());
        if (vr.getThumbnailKey() != null) tryDeleteFromMinio(vr.getThumbnailKey());
        repository.delete(vr);
    }

    @Override
    public List<VideoResponse> listBySchool(UUID schoolId) {
        return repository.findBySchoolIdOrderByCreatedAtDesc(schoolId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<VideoResponse> listByStaff(UUID staffId) {
        return repository.findByStaffIdOrderByCreatedAtDesc(staffId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<VideoResponse> listBySubject(UUID subjectId, UUID tenantId) {
        return repository.findBySubjectIdAndTenantIdOrderByCreatedAtDesc(subjectId, tenantId)
                .stream().map(this::toResponse).toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private VideoResource findOwned(UUID tenantId, UUID videoId) {
        return repository.findByIdAndTenantId(videoId, tenantId)
                .orElseThrow(() -> new NotFoundException("Video not found"));
    }

    private VideoResponse toResponse(VideoResource vr) {
        String streamUrl    = presignedGetUrl(vr.getFileKey());
        String thumbnailUrl = vr.getThumbnailKey() != null ? presignedGetUrl(vr.getThumbnailKey()) : null;
        return VideoResponse.from(vr, streamUrl, thumbnailUrl);
    }

    private String presignedGetUrl(String key) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(BUCKET).object(key).method(Method.GET)
                    .expiry(4, TimeUnit.HOURS).build());
        } catch (Exception e) {
            log.warn("Could not generate presigned GET URL for {}: {}", key, e.getMessage());
            return null;
        }
    }

    private String presignedPutUrl(String key, String contentType) {
        try {
            ensureBucketExists();
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(BUCKET).object(key).method(Method.PUT)
                    .expiry(1, TimeUnit.HOURS).build());
        } catch (Exception e) {
            log.warn("Could not generate presigned PUT URL for {}: {}", key, e.getMessage());
            return minioPublicUrl + "/" + BUCKET + "/" + key;
        }
    }

    private void tryDeleteFromMinio(String key) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder().bucket(BUCKET).object(key).build());
        } catch (Exception e) {
            log.warn("MinIO delete failed for {}: {}", key, e.getMessage());
        }
    }

    private void ensureBucketExists() {
        try {
            boolean exists = minioClient.bucketExists(
                    io.minio.BucketExistsArgs.builder().bucket(BUCKET).build());
            if (!exists) {
                minioClient.makeBucket(io.minio.MakeBucketArgs.builder().bucket(BUCKET).build());
                log.info("Created MinIO bucket: {}", BUCKET);
            }
        } catch (Exception e) {
            log.warn("Could not ensure MinIO bucket exists: {}", e.getMessage());
        }
    }

    private static String extensionFor(String contentType) {
        if (contentType == null) return ".mp4";
        return switch (contentType) {
            case "video/webm" -> ".webm";
            case "video/ogg"  -> ".ogv";
            case "video/avi"  -> ".avi";
            default           -> ".mp4";
        };
    }
}
