package com.cloudcampus.ai.gateway;

import com.cloudcampus.ai.usage.service.AiBudgetEnforcer;
import com.cloudcampus.ai.usage.service.UsageLoggingService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.web.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

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

    private static final Logger log = LoggerFactory.getLogger(AiGatewayService.class);

    // H-23: deny-list — patterns that indicate prompt-injection leakage or
    // the model being coerced into producing clearly off-topic harmful content.
    private static final Pattern CONTENT_FILTER = Pattern.compile(
            "(?i)(ignore (previous|all) instructions?|" +
            "jailbreak|" +
            "DAN mode|" +
            "as an? (AI|language model) I (cannot|must|will)|" +
            "my (previous|new) instructions?)",
            Pattern.CASE_INSENSITIVE);

    private final ChatModel           chatModel;
    private final UsageLoggingService usageLogging;
    private final AiBudgetEnforcer    budgetEnforcer;

    @Value("${app.ai.chat-model:claude-haiku-4-5-20251001}")
    private String chatModelName;

    @Value("${app.ai.max-output-chars:8000}")
    private int maxOutputChars;

    public AiGatewayService(Map<String, ChatModel> chatModels,
                            UsageLoggingService usageLogging,
                            AiBudgetEnforcer    budgetEnforcer,
                            @Value("${app.ai.chat-provider-bean:openAiChatModel}") String preferredChatBean) {
        this.chatModel      = resolveChatModel(chatModels, preferredChatBean);
        this.usageLogging   = usageLogging;
        this.budgetEnforcer = budgetEnforcer;
    }

    private ChatModel resolveChatModel(Map<String, ChatModel> chatModels, String preferredChatBean) {
        ChatModel preferred = chatModels.get(preferredChatBean);
        if (preferred != null) return preferred;

        if (chatModels.containsKey("openAiChatModel")) return chatModels.get("openAiChatModel");
        if (chatModels.containsKey("anthropicChatModel")) return chatModels.get("anthropicChatModel");
        if (chatModels.containsKey("mockChatModel")) return chatModels.get("mockChatModel");

        throw new IllegalStateException("No ChatModel bean available for AI gateway");
    }

    /**
     * Sends a rendered prompt to the configured AI provider and returns the text response.
     * Usage is logged regardless of success/failure.
     */
    public String complete(String renderedPrompt, String promptKey, UUID tenantId) {
        budgetEnforcer.enforce(tenantId);
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
            return guardOutput(content);

        } catch (Exception e) {
            usageLogging.record(tenantId, currentUserId(), providerName(), chatModelName,
                    promptKey, 0, 0, System.currentTimeMillis() - start, false, e.getMessage());
            throw e;
        }
    }

    /**
     * Sends system instructions and user input as separate role-separated messages
     * (CRIT-15 prompt injection defence). The LLM provider enforces the system/user
     * boundary — a malicious user question cannot override the system instructions.
     *
     * Use this instead of {@link #complete} whenever the prompt contains untrusted
     * user input (RAG queries, chatbot messages, template rendering with user data).
     */
    public String completeStructured(String systemText, String userText,
                                     String promptKey, UUID tenantId) {
        budgetEnforcer.enforce(tenantId);
        long start = System.currentTimeMillis();
        try {
            Prompt prompt = new Prompt(List.of(
                    new SystemMessage(systemText),
                    new UserMessage(userText)));
            ChatResponse response  = chatModel.call(prompt);
            String       content   = response.getResult().getOutput().getText();
            long         latencyMs = System.currentTimeMillis() - start;

            var usage = response.getMetadata() != null ? response.getMetadata().getUsage() : null;
            int in  = (usage != null && usage.getPromptTokens()     != null) ? usage.getPromptTokens().intValue()     : 0;
            int out = (usage != null && usage.getCompletionTokens() != null) ? usage.getCompletionTokens().intValue() : 0;

            usageLogging.record(tenantId, currentUserId(), providerName(), chatModelName,
                    promptKey, in, out, latencyMs, true, null);
            return guardOutput(content);

        } catch (Exception e) {
            usageLogging.record(tenantId, currentUserId(), providerName(), chatModelName,
                    promptKey, 0, 0, System.currentTimeMillis() - start, false, e.getMessage());
            throw e;
        }
    }

    // ── Output guardrails (H-23) ──────────────────────────────────────────────

    private String guardOutput(String content) {
        if (content == null) return "";
        if (CONTENT_FILTER.matcher(content).find()) {
            log.warn("AI output blocked by content filter [model={}]", chatModelName);
            throw new BadRequestException("AI response did not pass content safety check");
        }
        if (content.length() > maxOutputChars) {
            log.warn("AI output truncated: {} chars → {} [model={}]",
                    content.length(), maxOutputChars, chatModelName);
            return content.substring(0, maxOutputChars);
        }
        return content;
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
