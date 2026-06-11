package com.cloudcampus.common.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cloudcampus.common.health.SystemReadinessController;

import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SystemReadinessController.class)
@Import(CorrelationIdFilter.class)
class CorrelationIdFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void missingCorrelationIdGetsGeneratedAndReturned() throws Exception {
        String correlationId = mockMvc.perform(get("/v1/system/readiness"))
                .andExpect(status().isOk())
                .andExpect(header().exists(CorrelationIdFilter.RESPONSE_HEADER))
                .andReturn()
                .getResponse()
                .getHeader(CorrelationIdFilter.RESPONSE_HEADER);

        assertThat(correlationId).isNotBlank();
        assertThat(correlationId).matches("[0-9a-fA-F-]{36}");
    }

    @Test
    void safeCorrelationIdIsPreserved() throws Exception {
        mockMvc.perform(get("/v1/system/readiness").header("X-Correlation-Id", "web-portal:request_123"))
                .andExpect(status().isOk())
                .andExpect(header().string(CorrelationIdFilter.RESPONSE_HEADER, "web-portal:request_123"));
    }

    @Test
    void unsafeCorrelationIdIsReplaced() throws Exception {
        String correlationId = mockMvc.perform(get("/v1/system/readiness").header("X-Correlation-Id", "bad id with spaces"))
                .andExpect(status().isOk())
                .andExpect(header().exists(CorrelationIdFilter.RESPONSE_HEADER))
                .andReturn()
                .getResponse()
                .getHeader(CorrelationIdFilter.RESPONSE_HEADER);

        assertThat(correlationId).isNotEqualTo("bad id with spaces");
        assertThat(correlationId).matches("[0-9a-fA-F-]{36}");
    }

    @Test
    void mdcIsClearedAfterRequest() throws Exception {
        mockMvc.perform(get("/v1/system/readiness").header("X-Correlation-Id", "request-456"))
                .andExpect(status().isOk());

        assertThat(MDC.get("correlationId")).isNull();
    }
}
