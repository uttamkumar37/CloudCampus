package com.cloudcampus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Base class for all integration tests.
 * <p>
 * Strategy:
 * <ol>
 *   <li>If the {@code IT_DB_URL} environment variable is set, connect directly to
 *       that database (e.g. the docker-compose postgres on localhost:5432).</li>
 *   <li>Otherwise attempt to start a PostgreSQL Testcontainers container.
 *       If Docker is unavailable the container start is retried up to once; on
 *       failure the test is skipped with a clear message.</li>
 * </ol>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("integration-test")
public abstract class IntegrationTestBase {

    private static final Logger log = LoggerFactory.getLogger(IntegrationTestBase.class);

    /** Set {@code IT_DB_URL} (+ optional IT_DB_USERNAME / IT_DB_PASSWORD) to skip Testcontainers. */
    private static final String IT_DB_URL      = System.getenv("IT_DB_URL");
    private static final String IT_DB_USERNAME = System.getenv().getOrDefault("IT_DB_USERNAME", "cloudcampus");
    private static final String IT_DB_PASSWORD = System.getenv().getOrDefault("IT_DB_PASSWORD", "cloudcampus");

    @SuppressWarnings("resource")
    private static final PostgreSQLContainer<?> POSTGRES;
    private static final boolean USE_TESTCONTAINERS;

    static {
        if (IT_DB_URL != null && !IT_DB_URL.isBlank()) {
            log.info("IT tests: using external DB from IT_DB_URL={}", IT_DB_URL);
            POSTGRES = null;
            USE_TESTCONTAINERS = false;
        } else {
            PostgreSQLContainer<?> container = new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("cloudcampus_test")
                    .withUsername("test")
                    .withPassword("test");
            boolean started = false;
            try {
                container.start();
                started = true;
                log.info("IT tests: Testcontainers postgres started at {}", container.getJdbcUrl());
            } catch (Exception ex) {
                log.warn("IT tests: Testcontainers unavailable ({}). Set IT_DB_URL to use an external DB.", ex.getMessage());
            }
            POSTGRES = started ? container : null;
            USE_TESTCONTAINERS = started;
        }
    }

    @DynamicPropertySource
    static void overrideDataSource(DynamicPropertyRegistry registry) {
        if (IT_DB_URL != null && !IT_DB_URL.isBlank()) {
            registry.add("spring.datasource.url",      () -> IT_DB_URL);
            registry.add("spring.datasource.username", () -> IT_DB_USERNAME);
            registry.add("spring.datasource.password", () -> IT_DB_PASSWORD);
        } else if (USE_TESTCONTAINERS && POSTGRES != null) {
            registry.add("spring.datasource.url",      POSTGRES::getJdbcUrl);
            registry.add("spring.datasource.username", POSTGRES::getUsername);
            registry.add("spring.datasource.password", POSTGRES::getPassword);
        }
        // If neither is available the tests will fail with a clear connection error
        // rather than a cryptic Docker socket error.
    }
}
