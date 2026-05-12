package com.cloudcampus.notification.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.notification.dto.NotificationLogResponse;
import com.cloudcampus.notification.dto.PushNotificationRequest;
import com.cloudcampus.notification.dto.SendEmailRequest;
import com.cloudcampus.notification.entity.NotificationLog;
import com.cloudcampus.notification.repository.NotificationLogRepository;
import com.cloudcampus.notification.service.NotificationService;
import com.cloudcampus.notification.service.PushService;
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

import com.cloudcampus.common.web.RequestContext;

import java.util.UUID;

/**
 * School-admin notification endpoints (CC-1002 — E12 baseline).
 *
 * POST /v1/school-admin/schools/{schoolId}/notifications/send-email
 *      — Sends an email to any address using a named template.
 *        Fires async; always returns 202 Accepted immediately.
 *
 * GET  /v1/school-admin/schools/{schoolId}/notification-logs
 *      — Lists all notification dispatch attempts for the school,
 *        newest first (paginated). Shows SENT / FAILED outcomes.
 *
 * Security: SCHOOL_ADMIN may only act on their own school; TENANT_ADMIN
 * and SUPER_ADMIN may act on any school within their scope.
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}")
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Notifications", description = "Email / SMS notification management for school admins")
public class NotificationController {

    private final NotificationService         notificationService;
    private final NotificationLogRepository   logRepo;
    private final PushService                 pushService;

    public NotificationController(NotificationService       notificationService,
                                  NotificationLogRepository logRepo,
                                  PushService               pushService) {
        this.notificationService = notificationService;
        this.logRepo             = logRepo;
        this.pushService         = pushService;
    }

    // ── Send email ───────────────────────────────────────────────────────────

    /**
     * Dispatches an email asynchronously.
     *
     * Returns 202 immediately; the actual send happens on the notification thread pool.
     * The caller can poll {@code GET /notification-logs} to check the outcome.
     *
     * Input validation:
     *  - {@code to} must be a syntactically valid email address (RFC 5321).
     *  - {@code templateCode} must be a known enum value.
     *  - {@code variables} map is optional but must not contain null keys.
     */
    @PostMapping("/notifications/send-email")
    @Operation(summary = "Send a templated email to a recipient (async)")
    public ResponseEntity<ApiResponse<Void>> sendEmail(
            @PathVariable UUID schoolId,
            @Valid @RequestBody SendEmailRequest request) {

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());

        notificationService.sendEmailAsync(
                tenantId,
                schoolId,
                request.to(),
                request.templateCode(),
                request.safeVariables());

        return ResponseEntity.accepted()
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), null));
    }

    // ── Send push notification ───────────────────────────────────────────────

    /**
     * Sends a push notification to all devices registered to the target user.
     *
     * Returns 202 immediately; delivery happens asynchronously on the
     * notification thread pool. Poll {@code GET /notification-logs} for outcomes.
     *
     * FCM/APNs dispatch requires {@code app.firebase.enabled=true} in production.
     * In dev (Firebase disabled) each attempt is logged as FAILED with a clear
     * reason — no exception is thrown and the API still returns 202.
     */
    @PostMapping("/notifications/send-push")
    @Operation(summary = "Send a push notification to a user's registered devices (async)")
    public ResponseEntity<ApiResponse<Void>> sendPush(
            @PathVariable UUID schoolId,
            @Valid @RequestBody PushNotificationRequest request) {

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());

        pushService.sendPushToUserAsync(
                tenantId,
                schoolId,
                request.userId(),
                request.title(),
                request.body(),
                request.safeData());

        return ResponseEntity.accepted()
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), null));
    }

    // ── Notification log ─────────────────────────────────────────────────────

    /**
     * Returns paginated notification dispatch history for the school.
     *
     * Default page size: 20. Maximum: 200 (enforced by {@code Pagination}).
     */
    @GetMapping("/notification-logs")
    @Operation(summary = "List notification dispatch history for a school")
    public ResponseEntity<ApiResponse<PageResponse<NotificationLogResponse>>> listLogs(
            @PathVariable UUID schoolId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // Clamp size to prevent oversized payloads
        int effectiveSize = Math.min(size, 200);

        Page<NotificationLog> pageResult = logRepo.findBySchoolIdOrderByCreatedAtDesc(
                schoolId, PageRequest.of(page, effectiveSize));

        PageResponse<NotificationLogResponse> body = new PageResponse<>(
                pageResult.getContent().stream().map(NotificationLogResponse::from).toList(),
                page * effectiveSize,
                effectiveSize,
                pageResult.getTotalElements());

        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }
}
