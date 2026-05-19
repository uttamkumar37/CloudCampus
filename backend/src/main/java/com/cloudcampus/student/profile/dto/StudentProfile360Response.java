package com.cloudcampus.student.profile.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record StudentProfile360Response(
        UUID studentId,
        int profileCompletionPercent,
        List<ProfileSectionResponse> sections,
        List<TimelineItemResponse> timeline,
        Map<String, Object> quickStats,
        Map<String, Object> header,
        Map<String, Object> completion,
        Map<String, Object> activityFeed,
        List<Map<String, Object>> aiInsights,
        Map<String, Object> academicAnalytics,
        Map<String, Object> healthWellbeing,
        Map<String, Object> parentFamily,
        List<Map<String, Object>> riskProfile,
        Map<String, Object> documentVault,
        Map<String, Object> communicationCenter
) {}
