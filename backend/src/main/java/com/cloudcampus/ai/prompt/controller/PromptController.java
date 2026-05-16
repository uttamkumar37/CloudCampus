package com.cloudcampus.ai.prompt.controller;

import com.cloudcampus.ai.prompt.dto.CreatePromptRequest;
import com.cloudcampus.ai.prompt.dto.PromptRenderRequest;
import com.cloudcampus.ai.prompt.dto.PromptRenderResponse;
import com.cloudcampus.ai.prompt.dto.PromptTemplateResponse;
import com.cloudcampus.ai.prompt.service.PromptService;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/super-admin/ai/prompts")
@Tag(name = "Super Admin — AI Prompts", description = "Versioned prompt template registry (Super Admin only)")
public class PromptController {

    private final PromptService promptService;

    public PromptController(PromptService promptService) {
        this.promptService = promptService;
    }

    @Operation(summary = "List all prompt templates")
    @GetMapping
    public ApiResponse<List<PromptTemplateResponse>> listAll(
            @RequestParam(required = false) String key) {
        List<PromptTemplateResponse> result = key != null
                ? promptService.listByKey(key)
                : promptService.listAll();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), result);
    }

    @Operation(summary = "Get prompt template by ID")
    @GetMapping("/{id}")
    public ApiResponse<PromptTemplateResponse> get(@PathVariable UUID id) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), promptService.getById(id));
    }

    @Operation(summary = "Create new prompt (or new version of existing key)")
    @PostMapping
    public ApiResponse<PromptTemplateResponse> create(
            @Valid @RequestBody CreatePromptRequest request) {
        UUID userId = RequestContext.getUserId();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                promptService.create(request, userId));
    }

    @Operation(summary = "Activate a prompt version (deactivates all other versions for that key)")
    @PatchMapping("/{id}/activate")
    public ApiResponse<PromptTemplateResponse> activate(@PathVariable UUID id) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), promptService.activate(id));
    }

    @Operation(summary = "Deactivate a prompt version")
    @PatchMapping("/{id}/deactivate")
    public ApiResponse<PromptTemplateResponse> deactivate(@PathVariable UUID id) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), promptService.deactivate(id));
    }

    @Operation(summary = "Test render a prompt — substitutes variables and calls the AI")
    @PostMapping("/{id}/render")
    public ApiResponse<PromptRenderResponse> render(
            @PathVariable UUID id,
            @RequestBody PromptRenderRequest request) {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                promptService.render(id, request));
    }
}
