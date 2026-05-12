package com.cloudcampus.whatsapp.service;

import com.cloudcampus.whatsapp.entity.WhatsAppMessageLog;
import com.cloudcampus.whatsapp.repository.WhatsAppMessageLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * E14 baseline stub implementation of {@link WhatsAppService} (CC-1004).
 *
 * All dispatch attempts are logged as FAILED with a descriptive message:
 * "WhatsApp BSP not configured — E14 stub".
 *
 * To wire a real provider:
 *  1. Create a new @Service @Primary class that implements WhatsAppService.
 *  2. Inject HTTP client / BSP SDK.
 *  3. This stub can be removed or kept as a fallback.
 *
 * Thread model: runs on the {@code notificationExecutor} pool.
 * Each log row is committed in its own transaction ({@code REQUIRES_NEW}).
 */
@Service
public class WhatsAppServiceImpl implements WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppServiceImpl.class);
    private static final String STUB_MSG =
            "WhatsApp BSP not configured — E14 stub: provision a WhatsApp Business API account to enable real dispatch";

    private final WhatsAppMessageLogRepository logRepo;
    private final ObjectMapper                  objectMapper;

    public WhatsAppServiceImpl(WhatsAppMessageLogRepository logRepo,
                               ObjectMapper objectMapper) {
        this.logRepo       = logRepo;
        this.objectMapper  = objectMapper;
    }

    @Override
    @Async("notificationExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendTemplateAsync(UUID tenantId, UUID schoolId,
                                  String to, String templateName, String languageCode,
                                  List<String> parameters) {

        String paramsJson = serializeParams(parameters);

        WhatsAppMessageLog entry = WhatsAppMessageLog.create(
                tenantId, schoolId, to, templateName, languageCode, paramsJson);

        entry.markFailed(STUB_MSG);
        logRepo.save(entry);

        log.warn("WhatsApp dispatch skipped (stub) — to={} template={}", to, templateName);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String serializeParams(List<String> params) {
        if (params == null || params.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(params);
        } catch (JsonProcessingException ex) {
            log.warn("Failed to serialise WhatsApp template params: {}", ex.getMessage());
            return params.toString();   // fallback — still readable
        }
    }
}
