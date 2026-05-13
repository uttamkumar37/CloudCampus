package com.cloudcampus.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3 metadata and JWT security scheme (EUP-006 / B7).
 *
 * The JWT bearer scheme is registered globally so every secured endpoint
 * shows the lock icon in Swagger UI without per-endpoint repetition.
 *
 * This bean is always registered but the /v3/api-docs and /swagger-ui.html
 * endpoints are disabled in production via application.yml:
 *   springdoc.api-docs.enabled=false
 *   springdoc.swagger-ui.enabled=false
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI cloudCampusOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("CloudCampus API")
                        .description("Multi-tenant Digital School SaaS — Backend REST API")
                        .version("v1")
                        .contact(new Contact()
                                .name("CloudCampus Engineering")
                                .email("engineering@cloudcampus.io"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://cloudcampus.io")))
                // Register the JWT bearer scheme globally
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME,
                                new SecurityScheme()
                                        .name(BEARER_SCHEME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Paste the access token from POST /v1/auth/login")));
    }
}
