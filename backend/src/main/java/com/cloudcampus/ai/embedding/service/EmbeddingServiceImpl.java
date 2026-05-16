package com.cloudcampus.ai.embedding.service;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
class EmbeddingServiceImpl implements EmbeddingService {

    private final VectorStore vectorStore;

    EmbeddingServiceImpl(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @Override
    public void index(UUID tenantId, String entityType, UUID entityId, String content) {
        Document doc = new Document(
                entityId.toString(),
                content,
                Map.of(
                        "tenant_id",   tenantId.toString(),
                        "entity_type", entityType,
                        "entity_id",   entityId.toString()
                )
        );
        vectorStore.add(List.of(doc));
    }

    @Override
    public void indexWithMeta(UUID tenantId, String entityType, UUID entityId,
                               String content, String docId) {
        Document doc = new Document(
                entityId.toString(),
                content,
                Map.of(
                        "tenant_id",   tenantId.toString(),
                        "entity_type", entityType,
                        "entity_id",   entityId.toString(),
                        "doc_id",      docId
                )
        );
        vectorStore.add(List.of(doc));
    }

    @Override
    public void delete(UUID entityId) {
        vectorStore.delete(List.of(entityId.toString()));
    }

    @Override
    public void deleteByDocId(String docId) {
        FilterExpressionBuilder fb = new FilterExpressionBuilder();
        List<Document> hits = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query("*")
                        .topK(1000)
                        .filterExpression(fb.eq("doc_id", docId).build())
                        .build()
        );
        List<String> ids = hits.stream().map(Document::getId).collect(Collectors.toList());
        if (!ids.isEmpty()) {
            vectorStore.delete(ids);
        }
    }

    @Override
    public List<Document> search(UUID tenantId, String query, int topK) {
        FilterExpressionBuilder fb = new FilterExpressionBuilder();
        return vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(query)
                        .topK(topK)
                        .filterExpression(fb.eq("tenant_id", tenantId.toString()).build())
                        .build()
        );
    }
}
