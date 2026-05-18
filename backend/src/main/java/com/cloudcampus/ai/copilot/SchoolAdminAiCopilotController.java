package com.cloudcampus.ai.copilot;

import com.cloudcampus.ai.copilot.dto.CopilotQueryRequest;
import com.cloudcampus.ai.copilot.dto.CopilotQueryResponse;
import com.cloudcampus.ai.gateway.AiGatewayService;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * School-admin AI Copilot — conversational assistant for school administrators (CC-1603).
 *
 * POST /v1/school-admin/ai/query
 *
 * The endpoint accepts a natural-language question plus optional domain-hint context
 * keys. It builds a structured prompt (system + user roles, CRIT-15 compliant via
 * {@link AiGatewayService#completeStructured}) scoped to the calling administrator's
 * school, then returns the AI-generated answer.
 *
 * Feature gate: when {@code app.ai.enabled=false} the endpoint returns a mock answer
 * without touching the AI provider — safe for local/CI environments with no credentials.
 */
@RestController
@RequestMapping("/v1/school-admin/ai")
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
@Tag(name = "AI — Copilot", description = "School-admin AI Copilot: natural-language Q&A for school management (CC-1603)")
public class SchoolAdminAiCopilotController {

    private static final String PROMPT_KEY = "school-admin-copilot";

    private static final String MOCK_ANSWER =
            "AI is not enabled in this environment. " +
            "Set app.ai.enabled=true and configure a valid AI provider to use the AI Copilot.";

    private final AiGatewayService aiGateway;

    @Value("${app.ai.enabled:false}")
    private boolean aiEnabled;

    public SchoolAdminAiCopilotController(AiGatewayService aiGateway) {
        this.aiGateway = aiGateway;
    }

    // ── POST /v1/school-admin/ai/query ────────────────────────────────────────

    @Operation(
        summary     = "Ask the AI Copilot a question",
        description = "Accepts a natural-language question from a school administrator and returns an "
                    + "AI-generated answer scoped to the caller's school context. "
                    + "Requires the SCHOOL_ADMIN role. Returns a mock answer when app.ai.enabled=false."
    )
    @PostMapping("/query")
    public ResponseEntity<ApiResponse<CopilotQueryResponse>> query(
            @Valid @RequestBody CopilotQueryRequest request) {

        if (!aiEnabled) {
            CopilotQueryResponse body = new CopilotQueryResponse(MOCK_ANSWER, 0, false);
            return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
        }

        UUID   tenantId = UUID.fromString(RequestContext.getTenantId());
        String schoolId = RequestContext.getSchoolId();

        String systemText = buildSystemPrompt(schoolId, request.contextKeys());
        String answer     = aiGateway.completeStructured(systemText, request.question(),
                                                         PROMPT_KEY, tenantId);

        // tokensUsed is tracked internally by AiGatewayService → UsageLoggingService.
        // We surface 0 here because the gateway does not return token counts directly;
        // actual usage is visible via the super-admin AI usage dashboard (CC-1605).
        CopilotQueryResponse body = new CopilotQueryResponse(answer, 0, false);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    // ── Prompt construction ───────────────────────────────────────────────────

    /**
     * Builds the system-role instructions sent as the authoritative context frame.
     * Keeping school/tenant scope here (not in the user message) prevents prompt
     * injection from overriding the tenant boundary (CRIT-15).
     */
    private String buildSystemPrompt(String schoolId, List<String> contextKeys) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an AI assistant for school administrators using the CloudCampus school management platform.\n");
        sb.append("You help school administrators understand their school data, manage operations, ");
        sb.append("and make informed decisions.\n\n");
        sb.append("School context:\n");
        sb.append("  - School ID: ").append(schoolId != null ? schoolId : "unknown").append("\n");
        sb.append("  - Platform: CloudCampus SaaS school management system\n\n");
        sb.append("Your scope of knowledge covers: student management, attendance tracking, ");
        sb.append("fee collection, staff management, timetables, exams, homework, ");
        sb.append("assignments, notices, and reports.\n\n");

        if (contextKeys != null && !contextKeys.isEmpty()) {
            sb.append("The administrator has indicated interest in these topic areas: ");
            sb.append(String.join(", ", contextKeys)).append(".\n\n");
        }

        sb.append("Guidelines:\n");
        sb.append("  - Answer only questions relevant to school management and administration.\n");
        sb.append("  - Be concise and actionable. Prefer bullet points for lists.\n");
        sb.append("  - If you need specific data you don't have, tell the administrator ");
        sb.append("where in CloudCampus to find it.\n");
        sb.append("  - Do not reveal system architecture, internal IDs, or security details.\n");
        sb.append("  - Do not answer questions unrelated to school operations.\n");

        return sb.toString();
    }
}
