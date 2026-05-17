package com.cloudcampus.video.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "video_resources")
public class VideoResource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false)
    private UUID schoolId;

    @Column(name = "staff_id")
    private UUID staffId;

    @Column(name = "subject_id")
    private UUID subjectId;

    @Column(name = "class_id")
    private UUID classId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_key", nullable = false)
    private String fileKey;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "content_type", nullable = false)
    private String contentType = "video/mp4";

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "thumbnail_key")
    private String thumbnailKey;

    @Column(name = "upload_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private VideoUploadStatus uploadStatus = VideoUploadStatus.PENDING;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private VideoVisibility visibility = VideoVisibility.CLASS;

    @Column(name = "view_count", nullable = false)
    private long viewCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public static VideoResource create(UUID tenantId, UUID schoolId, UUID staffId,
                                       UUID subjectId, UUID classId,
                                       String title, String description,
                                       String fileKey, String contentType,
                                       VideoVisibility visibility) {
        VideoResource vr = new VideoResource();
        vr.tenantId    = tenantId;
        vr.schoolId    = schoolId;
        vr.staffId     = staffId;
        vr.subjectId   = subjectId;
        vr.classId     = classId;
        vr.title       = title;
        vr.description = description;
        vr.fileKey     = fileKey;
        vr.contentType = contentType != null ? contentType : "video/mp4";
        vr.visibility  = visibility != null ? visibility : VideoVisibility.CLASS;
        return vr;
    }

    public void markReady(long fileSizeBytes, Integer durationSeconds) {
        this.uploadStatus    = VideoUploadStatus.READY;
        this.fileSizeBytes   = fileSizeBytes;
        this.durationSeconds = durationSeconds;
        this.updatedAt       = Instant.now();
    }

    public void markFailed() {
        this.uploadStatus = VideoUploadStatus.FAILED;
        this.updatedAt    = Instant.now();
    }

    public void incrementViewCount() { this.viewCount++; }

    public void setThumbnailKey(String key) { this.thumbnailKey = key; this.updatedAt = Instant.now(); }

    // ── Getters ────────────────────────────────────────────────────────────────
    public UUID getId()                    { return id; }
    public UUID getTenantId()              { return tenantId; }
    public UUID getSchoolId()              { return schoolId; }
    public UUID getStaffId()               { return staffId; }
    public UUID getSubjectId()             { return subjectId; }
    public UUID getClassId()               { return classId; }
    public String getTitle()               { return title; }
    public String getDescription()         { return description; }
    public String getFileKey()             { return fileKey; }
    public Long getFileSizeBytes()         { return fileSizeBytes; }
    public String getContentType()         { return contentType; }
    public Integer getDurationSeconds()    { return durationSeconds; }
    public String getThumbnailKey()        { return thumbnailKey; }
    public VideoUploadStatus getUploadStatus() { return uploadStatus; }
    public VideoVisibility getVisibility() { return visibility; }
    public long getViewCount()             { return viewCount; }
    public Instant getCreatedAt()          { return createdAt; }
    public Instant getUpdatedAt()          { return updatedAt; }
}
