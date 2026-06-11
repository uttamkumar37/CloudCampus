package com.cloudcampus.intelligence.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class AiProviderTest {

    @Test
    void mockProviderReturnsDemoReadyStructuredResponse() {
        MockAiProvider provider = new MockAiProvider("mock-test-model");

        AiProviderResponse response = provider.generate(new AiProviderRequest(
                AiFeature.LESSON_PLAN_DRAFTING,
                "lesson_plan_generation",
                "TEACHER",
                "clear",
                "English",
                "Class VI Mathematics fractions",
                List.of("Active school scope is server-derived."),
                List.of("Do not expose cross-tenant data.")
        ));

        assertThat(response.provider()).isEqualTo("mock");
        assertThat(response.model()).isEqualTo("mock-test-model");
        assertThat(response.answer()).contains("Lesson plan");
        assertThat(response.highlights()).isNotEmpty();
        assertThat(response.recommendedActions()).isNotEmpty();
        assertThat(response.estimatedOutputUnits()).isPositive();
    }
}
