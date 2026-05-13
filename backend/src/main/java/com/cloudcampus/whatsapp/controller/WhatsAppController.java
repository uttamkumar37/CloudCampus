package com.cloudcampus.whatsapp.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.whatsapp.dto.SendWhatsAppRequest;
import com.cloudcampus.whatsapp.dto.WhatsAppMessageLogResponse;
import com.cloudcampus.whatsapp.entity.WhatsAppMessageLog;
import com.cloudcampus.whatsapp.repository.WhatsAppMessageLogRepository;
import com.cloudcampus.whatsapp.service.WhatsAppService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * WhatsApp Business API integration endpoints (CC-1004 / E14).
 *
 * POST /v1/school-admin/schools/{schoolId}/whatsapp/send
 *      — Sends a WhatsApp template message (async, 202 Accepted).
 *        E14 baseline: stub — logs FAILED until a real BSP is configured.
 *
 * GET  /v1/school-admin/schools/{schoolId}/whatsapp/logs
 *      — Paginated WhatsApp dispatch history.
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/whatsapp")
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN')")
@Tag(name = "WhatsApp", description = "WhatsApp Business API integration (E14)")
public class WhatsAppController {

    private final WhatsAppService               whatsAppService;
    private final WhatsAppMessageLogRepository  logRepo;

    public WhatsAppController(WhatsAppService whatsAppService,
                               WhatsAppMessageLogRepository logRepo) {
        this.whatsAppService = whatsAppService;
        this.logRepo         = logRepo;
    }

    // ── Send message ──────────────────────────────────────────────────────────

    @PostMapping("/send")
    @Operation(summary = "Send a WhatsApp template message to a recipient (async)")
    public ResponseEntity<ApiResponse<Void>> send(
            @PathVariable UUID schoolId,
            @Valid @RequestBody SendWhatsAppRequest request) {

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());

        whatsAppService.sendTemplateAsync(
                tenantId,
                schoolId,
                request.to(),
                request.templateName(),
                request.safeLanguageCode(),
                request.parameters());

        return ResponseEntity.accepted()
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), null));
    }

    // ── Message log ───────────────────────────────────────────────────────────

    @GetMapping("/logs")
    @Operation(summary = "List WhatsApp dispatch history for a school")
    public ResponseEntity<ApiResponse<PageResponse<WhatsAppMessageLogResponse>>> listLogs(
            @PathVariable UUID schoolId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        int effectiveSize = Math.min(size, 200);

        Page<WhatsAppMessageLog> pageResult = logRepo.findBySchoolIdOrderByCreatedAtDesc(
                schoolId, PageRequest.of(page, effectiveSize));

        PageResponse<WhatsAppMessageLogResponse> body = new PageResponse<>(
                pageResult.getContent().stream().map(WhatsAppMessageLogResponse::from).toList(),
                page * effectiveSize,
                effectiveSize,
                pageResult.getTotalElements());

        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }
}
