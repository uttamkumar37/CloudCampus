package com.cloudcampus.intelligence.ai;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/ai")
public class AiRetrievalController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AiKnowledgeRetrievalService aiKnowledgeRetrievalService;

    public AiRetrievalController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AiKnowledgeRetrievalService aiKnowledgeRetrievalService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.aiKnowledgeRetrievalService = aiKnowledgeRetrievalService;
    }

    @PostMapping("/knowledge/search")
    ResponseEntity<AiScopedRetrievalResponse> search(
            @Valid @RequestBody AiScopedRetrievalRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(aiKnowledgeRetrievalService.search(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }
}
