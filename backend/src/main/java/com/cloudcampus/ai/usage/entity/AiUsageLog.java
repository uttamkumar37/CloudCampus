package com.cloudcampus.ai.usage.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_usage_logs")
public class AiUsageLog {

    @Id
    private UUID id;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "school_id")
    private UUID schoolId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false)
    private String model;

    @Column(name = "prompt_key")
    private String promptKey;

    @Column(name = "input_tokens", nullable = false)
    private int inputTokens;

    @Column(name = "output_tokens", nullable = false)
    private int outputTokens;

    @Column(name = "latency_ms")
    private Integer latencyMs;

    @Column(nullable = false)
    private boolean success;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AiUsageLog() {}

    public static AiUsageLog create(UUID tenantId, UUID schoolId, UUID userId, String provider, String model,
                                    String promptKey, int inputTokens, int outputTokens,
                                    int latencyMs, boolean success, String errorMessage) {
        AiUsageLog log = new AiUsageLog();
        log.id           = UUID.randomUUID();
        log.tenantId     = tenantId;
        log.schoolId     = schoolId;
        log.userId       = userId;
        log.provider     = provider;
        log.model        = model;
        log.promptKey    = promptKey;
        log.inputTokens  = inputTokens;
        log.outputTokens = outputTokens;
        log.latencyMs    = latencyMs;
        log.success      = success;
        log.errorMessage = errorMessage;
        log.createdAt    = Instant.now();
        return log;
    }
}
