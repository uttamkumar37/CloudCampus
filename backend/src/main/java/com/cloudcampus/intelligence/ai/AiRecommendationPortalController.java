package com.cloudcampus.intelligence.ai;

import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/ai")
public class AiRecommendationPortalController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AiRecommendationPortalService aiRecommendationPortalService;

    public AiRecommendationPortalController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AiRecommendationPortalService aiRecommendationPortalService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.aiRecommendationPortalService = aiRecommendationPortalService;
    }

    @GetMapping("/recommendations")
    ResponseEntity<PageResponse<AiRecommendationPortalResponse>> recommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiRecommendationPortalService.recommendations(authenticatedUserResolver.requireUser(request), page, size));
    }

    @GetMapping("/recommendations/{id}")
    ResponseEntity<AiRecommendationPortalResponse> recommendation(@PathVariable String id, HttpServletRequest request) {
        return ResponseEntity.ok(aiRecommendationPortalService.recommendation(authenticatedUserResolver.requireUser(request), id));
    }

    @PostMapping("/recommendations/{id}/approve")
    ResponseEntity<AiRecommendationPortalResponse> approve(@PathVariable String id, HttpServletRequest request) {
        return ResponseEntity.ok(aiRecommendationPortalService.approve(authenticatedUserResolver.requireUser(request), id));
    }

    @PostMapping("/recommendations/{id}/reject")
    ResponseEntity<AiRecommendationPortalResponse> reject(
            @PathVariable String id,
            @RequestBody(required = false) AiRecommendationRejectRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiRecommendationPortalService.reject(authenticatedUserResolver.requireUser(request), id, requestBody));
    }

    @PostMapping("/recommendations/{id}/accept")
    ResponseEntity<AiRecommendationPortalResponse> accept(@PathVariable String id, HttpServletRequest request) {
        return ResponseEntity.ok(aiRecommendationPortalService.accept(authenticatedUserResolver.requireUser(request), id));
    }

    @PostMapping("/recommendations/{id}/execute")
    ResponseEntity<AiRecommendationPortalResponse> execute(@PathVariable String id, HttpServletRequest request) {
        return ResponseEntity.ok(aiRecommendationPortalService.execute(authenticatedUserResolver.requireUser(request), id));
    }

    @PostMapping("/recommendations/{id}/dismiss")
    ResponseEntity<AiRecommendationPortalResponse> dismiss(@PathVariable String id, HttpServletRequest request) {
        return ResponseEntity.ok(aiRecommendationPortalService.dismiss(authenticatedUserResolver.requireUser(request), id));
    }

    @GetMapping("/automation-rules")
    ResponseEntity<PageResponse<AiAutomationRulePortalResponse>> automationRules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiRecommendationPortalService.automationRules(authenticatedUserResolver.requireUser(request), page, size));
    }

    @PatchMapping("/automation-rules/{id}")
    ResponseEntity<Void> automationRuleUpdateNotAvailable(@PathVariable String id) {
        return ResponseEntity.status(405).build();
    }

    @GetMapping("/automation-runs")
    ResponseEntity<PageResponse<AiAutomationRunPortalResponse>> automationRuns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiRecommendationPortalService.automationRuns(authenticatedUserResolver.requireUser(request), page, size));
    }
}
