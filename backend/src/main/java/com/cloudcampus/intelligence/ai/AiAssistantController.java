package com.cloudcampus.intelligence.ai;

import com.cloudcampus.common.context.RequestContextResolver;
import com.cloudcampus.common.web.PageResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/ai")
public class AiAssistantController {

    private final RequestContextResolver requestContextResolver;
    private final AiAssistantService aiAssistantService;

    public AiAssistantController(
            RequestContextResolver requestContextResolver,
            AiAssistantService aiAssistantService
    ) {
        this.requestContextResolver = requestContextResolver;
        this.aiAssistantService = aiAssistantService;
    }

    @PostMapping("/assistant/query")
    ResponseEntity<AiAssistantResponse> assistant(
            @Valid @RequestBody AiAssistantQueryRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiAssistantService.assistant(requestContextResolver.requireContext(request), requestBody));
    }

    @PostMapping("/generate/notice")
    ResponseEntity<AiAssistantResponse> notice(
            @Valid @RequestBody AiNoticeGenerationRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiAssistantService.notice(requestContextResolver.requireContext(request), requestBody));
    }

    @PostMapping("/generate/homework")
    ResponseEntity<AiAssistantResponse> homework(
            @Valid @RequestBody AiHomeworkGenerationRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiAssistantService.homework(requestContextResolver.requireContext(request), requestBody));
    }

    @PostMapping("/generate/lesson-plan")
    ResponseEntity<AiAssistantResponse> lessonPlan(
            @Valid @RequestBody AiLessonPlanGenerationRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiAssistantService.lessonPlan(requestContextResolver.requireContext(request), requestBody));
    }

    @PostMapping("/generate/quiz")
    ResponseEntity<AiAssistantResponse> quiz(
            @Valid @RequestBody AiQuizGenerationRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiAssistantService.quiz(requestContextResolver.requireContext(request), requestBody));
    }

    @PostMapping("/reports/summary")
    ResponseEntity<AiAssistantResponse> reportSummary(
            @Valid @RequestBody AiReportSummaryRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiAssistantService.reportSummary(requestContextResolver.requireContext(request), requestBody));
    }

    @GetMapping("/settings")
    ResponseEntity<AiPortalSettingsResponse> settings(HttpServletRequest request) {
        return ResponseEntity.ok(aiAssistantService.settings(requestContextResolver.requireContext(request)));
    }

    @GetMapping("/audit-logs")
    ResponseEntity<PageResponse<AiPortalAuditLogResponse>> auditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiAssistantService.auditLogs(requestContextResolver.requireContext(request), page, size));
    }
}
