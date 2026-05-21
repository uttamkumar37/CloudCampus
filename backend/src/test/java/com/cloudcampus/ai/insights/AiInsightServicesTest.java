package com.cloudcampus.ai.insights;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AiInsightServicesTest {
    @Test
    void studentRiskServiceProducesHighRiskForWeakSignals() {
        AiInsightCard card = new StudentRiskInsightService().summarize(62, 42, 6);

        assertThat(card.key()).isEqualTo("student-risk-summary");
        assertThat(card.severity()).isEqualTo(AiInsightSeverity.HIGH);
        assertThat(card.confidence()).isBetween(0, 100);
        assertThat(card.signals()).contains("attendance", "exam", "assignments");
    }

    @Test
    void teacherWorkloadServiceCapsWorkloadMetadata() {
        AiInsightCard card = new TeacherWorkloadInsightService().summarize(8, 20, 20);

        assertThat(card.severity()).isEqualTo(AiInsightSeverity.HIGH);
        assertThat(card.metadata()).containsEntry("workloadScore", 100);
    }

    @Test
    void parentWeeklySummaryHandlesHealthyFamilySignals() {
        AiInsightCard card = new ParentWeeklySummaryInsightService().summarize(2, 94, 0, 0);

        assertThat(card.audience()).isEqualTo(AiInsightAudience.PARENT);
        assertThat(card.severity()).isEqualTo(AiInsightSeverity.LOW);
    }
}
