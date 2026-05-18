package com.cloudcampus.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Startup guard for the pgvector PostgreSQL extension (CRIT-12).
 *
 * V46__ai_foundation.sql runs CREATE EXTENSION IF NOT EXISTS vector.
 * On standard postgres:16-alpine this produces a cryptic Flyway error
 * ("could not open extension control file ... vector.control").
 *
 * This validator runs after the application context is ready and emits a
 * clear error log if the extension is missing, making diagnosis instant.
 *
 * Production requirement: use the pgvector/pgvector:pg16 image, or enable
 * the vector extension on your managed PostgreSQL service before first deploy:
 *   AWS RDS: enable in Parameter Group → shared_preload_libraries → pgvector
 *   Azure:   CREATE EXTENSION vector;  (supported on Flexible Server >= 15)
 *   Supabase/Neon: enabled by default
 */
@Component
public class PgVectorStartupValidator {

    private static final Logger log = LoggerFactory.getLogger(PgVectorStartupValidator.class);

    private final JdbcTemplate jdbc;

    public PgVectorStartupValidator(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validatePgVector() {
        try {
            Integer count = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM pg_extension WHERE extname = 'vector'",
                    Integer.class);

            if (count == null || count == 0) {
                log.error("""
                        ============================================================
                        STARTUP FAILURE: pgvector extension is NOT installed.

                        The AI/RAG features require the PostgreSQL 'vector' extension.
                        Flyway migration V46 will fail on next deploy without it.

                        Remediation options:
                          Docker (local dev):
                            Use image: pgvector/pgvector:pg16 in docker-compose.yml
                          AWS RDS:
                            Ensure rds.allowed_extensions includes 'vector'
                            then run: CREATE EXTENSION IF NOT EXISTS vector;
                          Azure Flexible Server:
                            CREATE EXTENSION IF NOT EXISTS vector;  (PG >= 15)
                          GCP Cloud SQL:
                            Enable via --database-flags=cloudsql.enable_pgvector=on
                          Supabase / Neon:
                            Already enabled by default
                        ============================================================""");
                throw new IllegalStateException(
                        "pgvector extension is not installed. AI features require pgvector. " +
                        "See startup logs for remediation steps.");
            } else {
                log.debug("pgvector extension present — vector search features available");
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            // Non-fatal: DB might be temporarily unavailable at this point.
            log.warn("Could not validate pgvector extension presence: {}", e.getMessage());
        }
    }
}
