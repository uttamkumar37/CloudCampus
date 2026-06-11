package com.cloudcampus.config;

import java.util.List;
import java.util.Map;

import com.cloudcampus.common.web.ApiErrorResponse;

import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH_SCHEME = "Bearer JWT";

    @Bean
    OpenAPI cloudCampusOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("CloudCampus API")
                        .version("v1")
                        .description("Multi-tenant school ERP SaaS backend API"))
                .servers(List.of(new Server()
                        .url("/")
                        .description("Current CloudCampus deployment")))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH_SCHEME, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .security(List.of(new SecurityRequirement().addList(BEARER_AUTH_SCHEME)));
    }

    @Bean
    GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("auth")
                .pathsToMatch("/v1/auth/**", "/v1/invitations/**")
                .build();
    }

    @Bean
    GroupedOpenApi meApi() {
        return grouped("me", "/v1/me/**");
    }

    @Bean
    GroupedOpenApi systemApi() {
        return grouped("system", "/v1/system/**");
    }

    @Bean
    GroupedOpenApi superAdminApi() {
        return grouped("super-admin", "/v1/super-admin/**");
    }

    @Bean
    GroupedOpenApi tenantAdminApi() {
        return grouped("tenant-admin", "/v1/tenant-admin/**");
    }

    @Bean
    GroupedOpenApi schoolAdminApi() {
        return grouped("school-admin", "/v1/school-admin/**");
    }

    @Bean
    GroupedOpenApi teacherApi() {
        return grouped("teacher", "/v1/teacher/**");
    }

    @Bean
    GroupedOpenApi financeApi() {
        return grouped("finance", "/v1/finance/**");
    }

    @Bean
    GroupedOpenApi parentApi() {
        return grouped("parent", "/v1/parent/**");
    }

    @Bean
    GroupedOpenApi studentApi() {
        return grouped("student", "/v1/student/**");
    }

    @Bean
    GroupedOpenApi aiApi() {
        return grouped("ai", "/v1/ai/**", "/v1/school-admin/ai/**", "/v1/super-admin/ai/**");
    }

    @Bean
    OpenApiCustomizer errorResponseCustomizer() {
        return openApi -> {
            if (openApi.getComponents() == null) {
                openApi.setComponents(new Components());
            }
            ModelConverters.getInstance().read(ApiErrorResponse.class)
                    .forEach((name, schema) -> openApi.getComponents().addSchemas(name, schema));

            openApi.getPaths().values().forEach(pathItem -> pathItem.readOperations().forEach(operation -> {
                addErrorResponse(operation, HttpStatus.BAD_REQUEST, "Bad request or validation failure.");
                addErrorResponse(operation, HttpStatus.UNAUTHORIZED, "Missing, expired, or invalid bearer token.");
                addErrorResponse(operation, HttpStatus.FORBIDDEN, "Authenticated user is not authorized for this resource.");
                addErrorResponse(operation, HttpStatus.NOT_FOUND, "Requested resource was not found.");
                addErrorResponse(operation, HttpStatus.CONFLICT, "Request conflicts with current resource state.");
                addErrorResponse(operation, HttpStatus.TOO_MANY_REQUESTS, "Request was rejected by a rate limit.");
            }));
        };
    }

    private GroupedOpenApi grouped(String group, String... paths) {
        return GroupedOpenApi.builder()
                .group(group)
                .pathsToMatch(paths)
                .build();
    }

    private void addErrorResponse(Operation operation, HttpStatus status, String description) {
        String statusCode = String.valueOf(status.value());
        if (operation.getResponses() == null) {
            operation.setResponses(new ApiResponses());
        }
        if (operation.getResponses().containsKey(statusCode)) {
            return;
        }
        operation.getResponses().addApiResponse(statusCode, new ApiResponse()
                .description(description)
                .content(new Content().addMediaType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE, new MediaType()
                        .schema(new Schema<>().$ref("#/components/schemas/ApiErrorResponse"))
                        .examples(Map.of(
                                statusCode, new Example()
                                        .summary(status.getReasonPhrase())
                                        .value(Map.of(
                                                "code", errorCode(status),
                                                "message", description,
                                                "timestamp", "2026-06-11T10:15:30Z"
                                        ))
                        )))));
    }

    private String errorCode(HttpStatus status) {
        return switch (status) {
            case BAD_REQUEST -> "BAD_REQUEST";
            case UNAUTHORIZED -> "UNAUTHORIZED";
            case FORBIDDEN -> "FORBIDDEN";
            case NOT_FOUND -> "NOT_FOUND";
            case CONFLICT -> "CONFLICT";
            case TOO_MANY_REQUESTS -> "TOO_MANY_REQUESTS";
            default -> status.name();
        };
    }
}
