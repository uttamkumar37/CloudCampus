package com.cloudcampus.ai.embedding.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("TASK-023 - Embedding tenant isolation")
class EmbeddingServiceTenantIsolationTest {

    private final VectorStore vectorStore = mock(VectorStore.class);
    private final EmbeddingServiceImpl service = new EmbeddingServiceImpl(vectorStore);

    @Test
    @DisplayName("Search always sends an exact tenant_id vector-store filter")
    void searchUsesExactTenantFilter() {
        UUID tenantA = UUID.randomUUID();
        UUID tenantB = UUID.randomUUID();
        when(vectorStore.similaritySearch(org.mockito.ArgumentMatchers.any(SearchRequest.class)))
                .thenReturn(List.of());

        service.search(tenantA, "fee policy", 4);

        ArgumentCaptor<SearchRequest> requestCaptor = ArgumentCaptor.forClass(SearchRequest.class);
        verify(vectorStore).similaritySearch(requestCaptor.capture());

        SearchRequest request = requestCaptor.getValue();
        assertThat(request.getQuery()).isEqualTo("fee policy");
        assertThat(request.getTopK()).isEqualTo(4);
        assertThat(request.hasFilterExpression()).isTrue();

        Filter.Expression filter = request.getFilterExpression();
        assertThat(filter.type()).isEqualTo(Filter.ExpressionType.EQ);
        assertThat(filter.left()).isInstanceOf(Filter.Key.class);
        assertThat(((Filter.Key) filter.left()).key()).isEqualTo("tenant_id");
        assertThat(filter.right()).isInstanceOf(Filter.Value.class);
        assertThat(((Filter.Value) filter.right()).value())
                .isEqualTo(tenantA.toString())
                .isNotEqualTo(tenantB.toString());
    }
}
