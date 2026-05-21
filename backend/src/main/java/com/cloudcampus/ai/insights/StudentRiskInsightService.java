package com.cloudcampus.ai.insights;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class StudentRiskInsightService {
    public AiInsightCard summarize(double attendancePct, double latestExamPct, int pendingAssignments) {
        AiInsightSeverity severity = severity(attendancePct, latestExamPct, pendingAssignments);
        String summary = "Attendance " + Math.round(attendancePct) + "%, latest exam "
                + Math.round(latestExamPct) + "%, pending assignments " + pendingAssignments + ".";
        String recommendation = switch (severity) {
            case HIGH -> "Create an intervention plan with teacher follow-up, parent communication, and weekly review.";
            case MEDIUM -> "Prioritize weak subjects and clear pending assignments this week.";
            default -> "Keep the current study rhythm and monitor attendance consistency.";
        };
        return new AiInsightCard(
                "student-risk-summary",
                AiInsightAudience.STUDENT,
                "Student Risk Summary",
                summary,
                recommendation,
                severity,
                confidence(attendancePct, latestExamPct, pendingAssignments),
                List.of("attendance", "exam", "assignments"),
                Map.of("attendancePct", attendancePct, "latestExamPct", latestExamPct, "pendingAssignments", pendingAssignments)
        );
    }

    private AiInsightSeverity severity(double attendancePct, double latestExamPct, int pendingAssignments) {
        if (attendancePct < 70 || latestExamPct < 45 || pendingAssignments > 5) return AiInsightSeverity.HIGH;
        if (attendancePct < 85 || latestExamPct < 60 || pendingAssignments > 2) return AiInsightSeverity.MEDIUM;
        return AiInsightSeverity.LOW;
    }

    private int confidence(double attendancePct, double latestExamPct, int pendingAssignments) {
        int signalCount = 0;
        if (attendancePct > 0) signalCount++;
        if (latestExamPct > 0) signalCount++;
        if (pendingAssignments >= 0) signalCount++;
        return 55 + signalCount * 12;
    }
}
