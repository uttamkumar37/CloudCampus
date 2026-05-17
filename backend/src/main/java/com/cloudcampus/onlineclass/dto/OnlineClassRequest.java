package com.cloudcampus.onlineclass.dto;

import com.cloudcampus.onlineclass.entity.MeetingPlatform;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.Instant;
import java.util.UUID;

public record OnlineClassRequest(
        UUID            classId,
        UUID            sectionId,
        UUID            subjectId,
        @NotBlank String         title,
        String          description,
        String          meetingUrl,
        MeetingPlatform platform,
        @NotNull @Future Instant scheduledAt,
        @Positive int   durationMinutes
) {}
