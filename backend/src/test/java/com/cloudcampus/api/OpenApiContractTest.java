package com.cloudcampus.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cloudcampus.config.OpenApiConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class OpenApiContractTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void openApiJsonDocumentsMetadataJwtAndErrors() throws Exception {
        String body = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode spec = objectMapper.readTree(body);
        assertThat(spec.at("/info/title").asText()).isEqualTo("CloudCampus API");
        assertThat(spec.at("/info/version").asText()).isEqualTo("v1");
        assertThat(spec.at("/info/description").asText())
                .isEqualTo("Multi-tenant school ERP SaaS backend API");
        assertThat(spec.at("/components/securitySchemes/" + OpenApiConfig.BEARER_AUTH_SCHEME + "/scheme").asText())
                .isEqualTo("bearer");
        assertThat(spec.at("/components/securitySchemes/" + OpenApiConfig.BEARER_AUTH_SCHEME + "/bearerFormat").asText())
                .isEqualTo("JWT");
        assertThat(spec.at("/components/schemas/ApiErrorResponse").isMissingNode()).isFalse();
        assertThat(spec.at("/paths/~1v1~1auth~1login/post/responses/400/content/application~1json/schema/$ref").asText())
                .isEqualTo("#/components/schemas/ApiErrorResponse");
    }

    @Test
    void openApiYamlCanBeGenerated() throws Exception {
        String yaml = mockMvc.perform(get("/v3/api-docs.yaml"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(yaml).contains("title: CloudCampus API");
        assertThat(yaml).contains("Bearer JWT");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "auth",
            "me",
            "system",
            "super-admin",
            "tenant-admin",
            "school-admin",
            "teacher",
            "finance",
            "parent",
            "student",
            "ai"
    })
    void groupedOpenApiSpecsGenerate(String group) throws Exception {
        String body = mockMvc.perform(get("/v3/api-docs/{group}", group))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode spec = objectMapper.readTree(body);
        assertThat(spec.at("/info/title").asText()).isEqualTo("CloudCampus API");
        assertThat(spec.path("paths").size()).isGreaterThan(0);
    }
}
