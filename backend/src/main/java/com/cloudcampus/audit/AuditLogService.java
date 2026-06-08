package com.cloudcampus.audit;

import java.util.LinkedHashMap;
import java.util.Map;

import com.cloudcampus.events.outbox.TransactionalOutboxService;
import com.cloudcampus.platform.superadmin.stats.SchoolStatsRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final TransactionalOutboxService transactionalOutboxService;
    private final SchoolStatsRepository schoolStatsRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository,
            ObjectMapper objectMapper,
            TransactionalOutboxService transactionalOutboxService,
            SchoolStatsRepository schoolStatsRepository
    ) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
        this.transactionalOutboxService = transactionalOutboxService;
        this.schoolStatsRepository = schoolStatsRepository;
    }

    @Transactional
    public AuditLog record(
            String tenantId,
            String schoolId,
            String actorType,
            String actorId,
            AuditAction action,
            String entityType,
            String entityId,
            String summary,
            Map<String, ?> metadata
    ) {
        AuditLog auditLog = auditLogRepository.save(new AuditLog(
                tenantId,
                schoolId,
                actorType,
                actorId,
                action,
                entityType,
                entityId,
                summary,
                metadataJson(metadata),
                null
        ));
        transactionalOutboxService.record(
                tenantId,
                schoolId,
                "AuditLog",
                auditLog.getId(),
                "AuditLogRecorded",
                "audit:" + auditLog.getId(),
                auditPayload(auditLog)
        );
        if (schoolId != null && !schoolId.isBlank()) {
            schoolStatsRepository.touchActivity(schoolId, auditLog.getCreatedAt());
        }
        return auditLog;
    }

    private Map<String, ?> auditPayload(AuditLog auditLog) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("auditLogId", auditLog.getId());
        payload.put("tenantId", auditLog.getTenantId());
        payload.put("schoolId", auditLog.getSchoolId());
        payload.put("actorType", auditLog.getActorType());
        payload.put("actorId", auditLog.getActorId());
        payload.put("action", auditLog.getAction().name());
        payload.put("entityType", auditLog.getEntityType());
        payload.put("entityId", auditLog.getEntityId());
        payload.put("summary", auditLog.getSummary());
        return payload;
    }

    private String metadataJson(Map<String, ?> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize audit metadata.", exception);
        }
    }
}
