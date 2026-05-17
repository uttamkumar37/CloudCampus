package com.cloudcampus.onlineclass.dto;

import com.cloudcampus.onlineclass.entity.MeetingPlatform;
import com.cloudcampus.onlineclass.entity.OnlineClass;
import com.cloudcampus.onlineclass.entity.OnlineClassStatus;

import java.time.Instant;
import java.util.UUID;

public record OnlineClassResponse(
        UUID              id,
        UUID              staffId,
        UUID              classId,
        UUID              sectionId,
        UUID              subjectId,
        String            title,
        String            description,
        String            meetingUrl,
        MeetingPlatform   platform,
        Instant           scheduledAt,
        int               durationMinutes,
        OnlineClassStatus status,
        String            recordingUrl,
        Instant           createdAt
) {
    public static OnlineClassResponse from(OnlineClass oc) {
        return new OnlineClassResponse(
                oc.getId(), oc.getStaffId(), oc.getClassId(), oc.getSectionId(),
                oc.getSubjectId(), oc.getTitle(), oc.getDescription(), oc.getMeetingUrl(),
                oc.getPlatform(), oc.getScheduledAt(), oc.getDurationMinutes(),
                oc.getStatus(), oc.getRecordingUrl(), oc.getCreatedAt()
        );
    }
}
