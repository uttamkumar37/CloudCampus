package com.cloudcampus.intelligence.ai;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/school-admin/ai/knowledge-documents")
public class SchoolAdminAiKnowledgeController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final AiKnowledgeRetrievalService aiKnowledgeRetrievalService;

    public SchoolAdminAiKnowledgeController(
            AuthenticatedUserResolver authenticatedUserResolver,
            AiKnowledgeRetrievalService aiKnowledgeRetrievalService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.aiKnowledgeRetrievalService = aiKnowledgeRetrievalService;
    }

    @PostMapping
    ResponseEntity<AiKnowledgeDocumentResponse> create(
            @Valid @RequestBody AiKnowledgeDocumentRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aiKnowledgeRetrievalService.createKnowledgeDocument(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping
    ResponseEntity<List<AiKnowledgeDocumentResponse>> list(HttpServletRequest request) {
        return ResponseEntity.ok(aiKnowledgeRetrievalService.listKnowledgeDocuments(
                authenticatedUserResolver.requireUser(request)
        ));
    }
}
