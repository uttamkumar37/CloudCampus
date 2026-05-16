package com.cloudcampus.ai.knowledge.controller;

import com.cloudcampus.ai.knowledge.dto.IngestRequest;
import com.cloudcampus.ai.knowledge.dto.KnowledgeDocumentResponse;
import com.cloudcampus.ai.knowledge.dto.RagQueryRequest;
import com.cloudcampus.ai.knowledge.dto.RagQueryResponse;
import com.cloudcampus.ai.knowledge.service.KnowledgeBaseService;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Super-admin API for managing tenant knowledge bases (CC-1603).
 *
 * Flow:
 *   1. POST  /ingest              — chunk + embed a text document
 *   2. GET   /                    — list all indexed documents for a tenant
 *   3. DELETE /{docId}            — remove document + all its chunk embeddings
 *   4. POST  /query               — RAG: retrieve context → AI answer
 */
@RestController
@RequestMapping("/v1/super-admin/ai/knowledge/{tenantId}")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "AI — Knowledge Base", description = "Tenant knowledge base — RAG ingestion & retrieval (CC-1603)")
public class KnowledgeBaseController {

    private final KnowledgeBaseService service;

    public KnowledgeBaseController(KnowledgeBaseService service) {
        this.service = service;
    }

    @Operation(summary = "Ingest a document",
               description = "Chunks the content, generates embeddings, and stores them in the vector store.")
    @PostMapping("/ingest")
    public ResponseEntity<ApiResponse<KnowledgeDocumentResponse>> ingest(
            @PathVariable UUID tenantId,
            @Valid @RequestBody IngestRequest request) {
        UUID userId = RequestContext.getUserId();
        KnowledgeDocumentResponse body = service.ingest(tenantId, userId, request.title(), request.content());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List knowledge documents", description = "Returns all indexed documents for this tenant.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<KnowledgeDocumentResponse>>> list(
            @PathVariable UUID tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.list(tenantId)));
    }

    @Operation(summary = "Delete a document",
               description = "Removes the document record and all its chunk embeddings from the vector store.")
    @DeleteMapping("/{docId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID tenantId,
            @PathVariable UUID docId) {
        service.delete(tenantId, docId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "RAG query",
               description = "Retrieves top-K relevant chunks for the question and returns an AI-generated answer.")
    @PostMapping("/query")
    public ResponseEntity<ApiResponse<RagQueryResponse>> query(
            @PathVariable UUID tenantId,
            @Valid @RequestBody RagQueryRequest request) {
        RagQueryResponse body = service.query(tenantId, request.question());
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }
}
