package com.cloudcampus.ai.knowledge.service;

import com.cloudcampus.ai.embedding.service.EmbeddingService;
import com.cloudcampus.ai.gateway.AiGatewayService;
import com.cloudcampus.ai.knowledge.repository.KnowledgeDocumentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.document.Document;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("TASK-023 - Knowledge-base tenant isolation")
class KnowledgeBaseTenantIsolationTest {

    private final KnowledgeDocumentRepository docRepo = mock(KnowledgeDocumentRepository.class);
    private final EmbeddingService embeddings = mock(EmbeddingService.class);
    private final AiGatewayService gateway = mock(AiGatewayService.class);
    private final KnowledgeBaseServiceImpl service = new KnowledgeBaseServiceImpl(docRepo, embeddings, gateway);

    @Test
    @DisplayName("RAG context and sources exclude chunks whose metadata belongs to another tenant")
    void queryFiltersCrossTenantHitsBeforeCallingAiGateway() {
        UUID tenantA = UUID.randomUUID();
        UUID tenantB = UUID.randomUUID();
        String question = "What is the fee reminder process?";
        Document tenantAHit = new Document(
                UUID.randomUUID().toString(),
                "Tenant A policy: fee reminders are sent from Reports > Fees.",
                Map.of("tenant_id", tenantA.toString(), "entity_type", "tenant-a-policy"));
        Document tenantBHit = new Document(
                UUID.randomUUID().toString(),
                "Tenant B confidential policy: discount all late fees.",
                Map.of("tenant_id", tenantB.toString(), "entity_type", "tenant-b-policy"));

        when(embeddings.search(tenantA, question, 4)).thenReturn(List.of(tenantAHit, tenantBHit));
        when(gateway.completeStructured(
                org.mockito.ArgumentMatchers.anyString(),
                eq(question),
                eq("knowledge_base_rag"),
                eq(tenantA)))
                .thenReturn("Use Reports > Fees.");

        var response = service.query(tenantA, question);

        ArgumentCaptor<String> systemCaptor = ArgumentCaptor.forClass(String.class);
        verify(gateway).completeStructured(systemCaptor.capture(), eq(question),
                eq("knowledge_base_rag"), eq(tenantA));

        assertThat(systemCaptor.getValue())
                .contains("Tenant A policy")
                .doesNotContain("Tenant B confidential policy")
                .doesNotContain(tenantB.toString());
        assertThat(response.answer()).isEqualTo("Use Reports > Fees.");
        assertThat(response.sourceTitles()).containsExactly("tenant-a-policy");
        assertThat(response.chunksUsed()).isEqualTo(1);
    }
}
