package com.cloudcampus.onlineclass.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "online_classes")
public class OnlineClass {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "school_id", nullable = false)
    private UUID schoolId;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    @Column(name = "class_id")
    private UUID classId;

    @Column(name = "section_id")
    private UUID sectionId;

    @Column(name = "subject_id")
    private UUID subjectId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "meeting_url")
    private String meetingUrl;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MeetingPlatform platform = MeetingPlatform.CUSTOM;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes = 60;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OnlineClassStatus status = OnlineClassStatus.SCHEDULED;

    @Column(name = "recording_url")
    private String recordingUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public static OnlineClass create(UUID tenantId, UUID schoolId, UUID staffId,
                                     UUID classId, UUID sectionId, UUID subjectId,
                                     String title, String description, String meetingUrl,
                                     MeetingPlatform platform, Instant scheduledAt, int durationMinutes) {
        OnlineClass oc = new OnlineClass();
        oc.tenantId       = tenantId;
        oc.schoolId       = schoolId;
        oc.staffId        = staffId;
        oc.classId        = classId;
        oc.sectionId      = sectionId;
        oc.subjectId      = subjectId;
        oc.title          = title;
        oc.description    = description;
        oc.meetingUrl     = meetingUrl;
        oc.platform       = platform != null ? platform : MeetingPlatform.CUSTOM;
        oc.scheduledAt    = scheduledAt;
        oc.durationMinutes = durationMinutes;
        return oc;
    }

    public void start()  { this.status = OnlineClassStatus.LIVE;      this.updatedAt = Instant.now(); }
    public void end()    { this.status = OnlineClassStatus.ENDED;     this.updatedAt = Instant.now(); }
    public void cancel() { this.status = OnlineClassStatus.CANCELLED; this.updatedAt = Instant.now(); }

    public void setRecordingUrl(String url) { this.recordingUrl = url; this.updatedAt = Instant.now(); }
    public void setMeetingUrl(String url)   { this.meetingUrl   = url; this.updatedAt = Instant.now(); }

    // ── Getters ────────────────────────────────────────────────────────────────
    public UUID getId()                  { return id; }
    public UUID getTenantId()            { return tenantId; }
    public UUID getSchoolId()            { return schoolId; }
    public UUID getStaffId()             { return staffId; }
    public UUID getClassId()             { return classId; }
    public UUID getSectionId()           { return sectionId; }
    public UUID getSubjectId()           { return subjectId; }
    public String getTitle()             { return title; }
    public String getDescription()       { return description; }
    public String getMeetingUrl()        { return meetingUrl; }
    public MeetingPlatform getPlatform() { return platform; }
    public Instant getScheduledAt()      { return scheduledAt; }
    public int getDurationMinutes()      { return durationMinutes; }
    public OnlineClassStatus getStatus() { return status; }
    public String getRecordingUrl()      { return recordingUrl; }
    public Instant getCreatedAt()        { return createdAt; }
    public Instant getUpdatedAt()        { return updatedAt; }
}
