package com.cloudcampus.audit.controller;

import com.cloudcampus.audit.dto.AuditLogResponse;
import com.cloudcampus.audit.entity.AuditAction;
import com.cloudcampus.audit.entity.AuditLog;
import com.cloudcampus.audit.repository.AuditLogRepository;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.RequestContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@Tag(name = "Audit Logs", description = "Audit log viewer endpoints")
public class AuditLogViewerController {

    private static final int MAX_PAGE_SIZE = 200;

    private final AuditLogRepository auditLogRepository;

    public AuditLogViewerController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/v1/school-admin/audit-logs")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','TENANT_ADMIN')")
    @Operation(summary = "List audit logs for the current tenant")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> schoolAdminAuditLogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) AuditAction eventType,
            @RequestParam(required = false) UUID actorId,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(MAX_PAGE_SIZE) int size) {

        String tenant = RequestContext.getTenantId();
        if (tenant == null || tenant.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Tenant context is required");
        }

        return list(UUID.fromString(tenant), category, eventType, actorId, resourceType, resourceId, from, to, page, size);
    }

    @GetMapping("/v1/super-admin/audit-logs")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "List audit logs across tenants")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> superAdminAuditLogs(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) AuditAction eventType,
            @RequestParam(required = false) UUID actorId,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(MAX_PAGE_SIZE) int size) {

        return list(tenantId, category, eventType, actorId, resourceType, resourceId, from, to, page, size);
    }

    private ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> list(
            UUID tenantId,
            String category,
            AuditAction eventType,
            UUID actorId,
            String resourceType,
            String resourceId,
            Instant from,
            Instant to,
            int page,
            int size) {

        Page<AuditLog> result = auditLogRepository.findAll(
                specification(tenantId, category, eventType, actorId, resourceType, resourceId, from, to),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        PageResponse<AuditLogResponse> body = new PageResponse<>(
                result.getContent().stream().map(AuditLogResponse::from).toList(),
                page * size,
                size,
                result.getTotalElements());

        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private static Specification<AuditLog> specification(
            UUID tenantId,
            String category,
            AuditAction eventType,
            UUID actorId,
            String resourceType,
            String resourceId,
            Instant from,
            Instant to) {

        Specification<AuditLog> spec = Specification.unrestricted();

        if (tenantId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("tenantId"), tenantId));
        }

        String categoryFilter = blankToNull(category);
        if (categoryFilter != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), categoryFilter));
        }

        if (eventType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("eventType"), eventType));
        }

        if (actorId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("actorId"), actorId));
        }

        String resourceTypeFilter = blankToNull(resourceType);
        if (resourceTypeFilter != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.lower(root.get("resourceType")), resourceTypeFilter.toLowerCase()));
        }

        String resourceIdFilter = blankToNull(resourceId);
        if (resourceIdFilter != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("resourceId"), resourceIdFilter));
        }

        if (from != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        }

        if (to != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
        }

        return spec;
    }
}
