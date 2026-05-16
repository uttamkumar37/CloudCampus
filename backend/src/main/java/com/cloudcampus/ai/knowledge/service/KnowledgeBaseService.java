package com.cloudcampus.ai.knowledge.service;

import com.cloudcampus.ai.knowledge.dto.KnowledgeDocumentResponse;
import com.cloudcampus.ai.knowledge.dto.RagQueryResponse;

import java.util.List;
import java.util.UUID;

public interface KnowledgeBaseService {

    /** Chunks and indexes a document for the given tenant. */
    KnowledgeDocumentResponse ingest(UUID tenantId, UUID createdBy, String title, String content);

    /** Lists all indexed documents for a tenant. */
    List<KnowledgeDocumentResponse> list(UUID tenantId);

    /** Deletes a document and all its chunk embeddings from the vector store. */
    void delete(UUID tenantId, UUID docId);

    /**
     * RAG query: retrieves the top-K most relevant chunks for the question,
     * composes a grounded prompt, and returns an AI-generated answer.
     */
    RagQueryResponse query(UUID tenantId, String question);
}
