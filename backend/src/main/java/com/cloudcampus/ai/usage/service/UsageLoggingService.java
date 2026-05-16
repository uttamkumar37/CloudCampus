package com.cloudcampus.ai.usage.service;

import com.cloudcampus.ai.usage.entity.AiUsageLog;
import com.cloudcampus.ai.usage.repository.AiUsageLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UsageLoggingService {

    private static final Logger log = LoggerFactory.getLogger(UsageLoggingService.class);

    private final AiUsageLogRepository repo;

    public UsageLoggingService(AiUsageLogRepository repo) {
        this.repo = repo;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(UUID tenantId, UUID userId, String provider, String model,
                       String promptKey, int inputTokens, int outputTokens,
                       long latencyMs, boolean success, String errorMessage) {
        try {
            repo.save(AiUsageLog.create(tenantId, userId, provider, model,
                    promptKey, inputTokens, outputTokens, (int) latencyMs, success, errorMessage));
        } catch (Exception e) {
            log.warn("Failed to record AI usage log (non-fatal): {}", e.getMessage());
        }
    }
}
