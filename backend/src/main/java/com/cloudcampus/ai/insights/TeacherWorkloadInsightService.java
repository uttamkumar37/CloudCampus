package com.cloudcampus.ai.insights;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TeacherWorkloadInsightService {
    public AiInsightCard summarize(int todayClasses, int pendingReviewItems, int publishedWorkItems) {
        int workloadScore = Math.min(100, todayClasses * 12 + pendingReviewItems * 6 + publishedWorkItems * 2);
        AiInsightSeverity severity = workloadScore > 80
                ? AiInsightSeverity.HIGH
                : workloadScore > 55 ? AiInsightSeverity.MEDIUM : AiInsightSeverity.LOW;
        String recommendation = severity == AiInsightSeverity.HIGH
                ? "Protect grading time and defer non-urgent uploads until the review queue is lower."
                : "Current workload is manageable; use spare time for lesson preparation and feedback quality.";
        return new AiInsightCard(
                "teacher-workload-summary",
                AiInsightAudience.TEACHER,
                "Teacher Workload Summary",
                "Workload score is " + workloadScore + " from classes, review queue, and posted work.",
                recommendation,
                severity,
                82,
                List.of("classes", "reviewQueue", "publishedWork"),
                Map.of("todayClasses", todayClasses, "pendingReviewItems", pendingReviewItems,
                        "publishedWorkItems", publishedWorkItems, "workloadScore", workloadScore)
        );
    }
}
