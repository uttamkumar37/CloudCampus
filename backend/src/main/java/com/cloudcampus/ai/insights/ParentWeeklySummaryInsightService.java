package com.cloudcampus.ai.insights;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ParentWeeklySummaryInsightService {
    public AiInsightCard summarize(int linkedChildren, double averageAttendancePct, int homeworkItems, long feeBalancePaise) {
        AiInsightSeverity severity = averageAttendancePct < 70 || feeBalancePaise > 0 && homeworkItems > 5
                ? AiInsightSeverity.HIGH
                : averageAttendancePct < 85 || feeBalancePaise > 0 || homeworkItems > 0
                ? AiInsightSeverity.MEDIUM
                : AiInsightSeverity.LOW;
        String recommendation = severity == AiInsightSeverity.LOW
                ? "Continue the weekly review habit and check notices before school starts."
                : "Review homework, attendance, and fee follow-up with the school this week.";
        return new AiInsightCard(
                "parent-weekly-summary",
                AiInsightAudience.PARENT,
                "Parent Weekly Summary",
                linkedChildren + " linked child record(s), attendance " + Math.round(averageAttendancePct)
                        + "%, homework " + homeworkItems + ", fee balance paise " + feeBalancePaise + ".",
                recommendation,
                severity,
                78,
                List.of("linkedChildren", "attendance", "homework", "fees"),
                Map.of("linkedChildren", linkedChildren, "averageAttendancePct", averageAttendancePct,
                        "homeworkItems", homeworkItems, "feeBalancePaise", feeBalancePaise)
        );
    }
}
