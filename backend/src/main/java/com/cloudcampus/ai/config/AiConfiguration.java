package com.cloudcampus.ai.config;

import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/**
 * Registers mock AI beans when no real provider is configured (dev / CI).
 * Real beans from spring-ai-starter-model-anthropic / spring-ai-starter-model-openai
 * are registered by Spring AI auto-configuration when enabled=true and a valid API key
 * is present. The @ConditionalOnMissingBean guards here fire only when those are absent.
 */
@Configuration
public class AiConfiguration {

    @Bean
    @ConditionalOnMissingBean(ChatModel.class)
    public ChatModel mockChatModel() {
        return new MockChatModel();
    }

    @Bean
    @ConditionalOnProperty(name = "app.ai.mock.embedding.enabled", havingValue = "true", matchIfMissing = false)
    @ConditionalOnMissingBean(EmbeddingModel.class)
    public EmbeddingModel mockEmbeddingModel() {
        return new MockEmbeddingModel();
    }

    // ── Mock implementations ──────────────────────────────────────────────

    static class MockChatModel implements ChatModel {
        @Override
        public ChatResponse call(Prompt prompt) {
            // L-17: do not echo back any part of the prompt — prevents leaking
            // user input or system instructions into logs / API responses.
            AssistantMessage msg = new AssistantMessage("[Mock AI — real provider not configured]");
            return new ChatResponse(List.of(new Generation(msg)));
        }
    }

    static class MockEmbeddingModel implements EmbeddingModel {
        private static final int DIMS = 1536;

        @Override
        public EmbeddingResponse call(EmbeddingRequest request) {
            List<Embedding> result = new ArrayList<>();
            List<String> texts = request.getInstructions();
            for (int i = 0; i < texts.size(); i++) {
                result.add(new Embedding(unitVector(texts.get(i).hashCode()), i));
            }
            return new EmbeddingResponse(result);
        }

        @Override
        public float[] embed(org.springframework.ai.document.Document document) {
            return unitVector(document.getText().hashCode());
        }

        @Override
        public int dimensions() {
            return DIMS;
        }

        private float[] unitVector(int seed) {
            float[] v = new float[DIMS];
            v[Math.abs(seed) % DIMS] = 1.0f;
            return v;
        }
    }
}
