package com.cloudcampus.ai.gateway;

import com.cloudcampus.ai.usage.service.UsageLoggingService;
import com.cloudcampus.common.web.RequestContext;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Thin wrapper around Spring AI's ChatModel that adds:
 * - structured usage logging per call
 * - provider/model metadata extraction
 * - safe error propagation
 *
 * In dev (APP_AI_ENABLED=false) the injected ChatModel is the MockChatModel from
 * AiConfiguration — no real API calls or credentials needed.
 */
@Service
public class AiGatewayService {

    private final ChatModel           chatModel;
    private final UsageLoggingService usageLogging;

    @Value("${app.ai.chat-model:claude-haiku-4-5-20251001}")
    private String chatModelName;

    public AiGatewayService(ChatModel chatModel, UsageLoggingService usageLogging) {
        this.chatModel    = chatModel;
        this.usageLogging = usageLogging;
    }

    /**
     * Sends a rendered prompt to the configured AI provider and returns the text response.
     * Usage is logged regardless of success/failure.
     */
    public String complete(String renderedPrompt, String promptKey, UUID tenantId) {
        long start = System.currentTimeMillis();
        try {
            ChatResponse response  = chatModel.call(new Prompt(renderedPrompt));
            String       content   = response.getResult().getOutput().getText();
            long         latencyMs = System.currentTimeMillis() - start;

            var usage = response.getMetadata() != null ? response.getMetadata().getUsage() : null;
            int in  = (usage != null && usage.getPromptTokens()     != null) ? usage.getPromptTokens().intValue()     : 0;
            int out = (usage != null && usage.getCompletionTokens() != null) ? usage.getCompletionTokens().intValue() : 0;

            usageLogging.record(tenantId, currentUserId(), providerName(), chatModelName,
                    promptKey, in, out, latencyMs, true, null);
            return content;

        } catch (Exception e) {
            usageLogging.record(tenantId, currentUserId(), providerName(), chatModelName,
                    promptKey, 0, 0, System.currentTimeMillis() - start, false, e.getMessage());
            throw e;
        }
    }

    private String providerName() {
        return chatModel.getClass().getSimpleName().contains("Anthropic") ? "anthropic"
             : chatModel.getClass().getSimpleName().contains("OpenAi")    ? "openai"
             : "mock";
    }

    private UUID currentUserId() {
        try { return RequestContext.getUserId(); } catch (Exception e) { return null; }
    }
}
