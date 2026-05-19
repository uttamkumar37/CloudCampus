package com.cloudcampus.staff.profile.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record StaffProfile360Response(
        UUID staffId,
        int profileCompletionPercent,
        List<StaffProfileSectionResponse> sections,
        List<StaffTimelineItemResponse> timeline,
        Map<String, Object> quickStats,
        Map<String, Object> header,
        Map<String, Object> completion,
        Map<String, Object> activityFeed,
        List<Map<String, Object>> aiInsights,
        Map<String, Object> performanceAnalytics,
        Map<String, Object> hrEmployment,
        Map<String, Object> payrollFinance,
        Map<String, Object> skillsDevelopment,
        Map<String, Object> attendanceLeave,
        Map<String, Object> documentVault,
        Map<String, Object> communicationCenter,
        Map<String, Object> healthWellbeing,
        List<Map<String, Object>> riskProfile,
        Map<String, Object> roleViews
) {}
