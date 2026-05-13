package com.cloudcampus.leave.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.leave.dto.LeaveRequestResponse;
import com.cloudcampus.leave.entity.LeaveRequest;
import com.cloudcampus.leave.entity.LeaveStatus;
import com.cloudcampus.leave.entity.LeaveType;
import com.cloudcampus.leave.repository.LeaveRequestRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Staff leave request management (CC-0604).
 *
 * POST   /v1/school-admin/schools/{schoolId}/leave-requests          — create request
 * GET    /v1/school-admin/schools/{schoolId}/leave-requests          — list (filterable)
 * PATCH  /v1/school-admin/schools/{schoolId}/leave-requests/{id}/approve — approve
 * PATCH  /v1/school-admin/schools/{schoolId}/leave-requests/{id}/reject  — reject
 * DELETE /v1/school-admin/schools/{schoolId}/leave-requests/{id}         — cancel (PENDING only)
 */
@RestController
@RequestMapping("/v1/school-admin/schools/{schoolId}/leave-requests")
@PreAuthorize("hasRole('SCHOOL_ADMIN')")
@Tag(name = "Leave Management", description = "Staff leave request workflow")
public class LeaveRequestController {

    public record CreateRequest(
            @NotNull UUID staffId,
            @NotNull LeaveType leaveType,
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            @NotBlank String reason
    ) {}

    public record ReviewRequest(String notes) {}

    private final LeaveRequestRepository leaveRepo;
    private final SchoolRepository       schoolRepo;

    public LeaveRequestController(
            LeaveRequestRepository leaveRepo,
            SchoolRepository       schoolRepo) {
        this.leaveRepo  = leaveRepo;
        this.schoolRepo = schoolRepo;
    }

    @Operation(summary = "Create leave request")
    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> create(
            @PathVariable UUID schoolId,
            @Valid @RequestBody CreateRequest req) {

        validateSchool(schoolId);

        if (!req.endDate().isAfter(req.startDate()) && !req.endDate().equals(req.startDate())) {
            throw new BadRequestException("end_date must be >= start_date");
        }

        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        LeaveRequest lr = LeaveRequest.create(
                tenantId, schoolId, req.staffId(),
                req.leaveType(), req.startDate(), req.endDate(), req.reason());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                        LeaveRequestResponse.from(leaveRepo.save(lr))));
    }

    @Operation(summary = "List leave requests",
               description = "Filterable by status and/or staffId. Page size default 20.")
    @GetMapping
    public ApiResponse<List<LeaveRequestResponse>> list(
            @PathVariable UUID schoolId,
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam(required = false) UUID staffId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        validateSchool(schoolId);
        Page<LeaveRequest> result = leaveRepo.findFiltered(
                schoolId, status, staffId, PageRequest.of(page, size));
        List<LeaveRequestResponse> items = result.getContent().stream()
                .map(LeaveRequestResponse::from).toList();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), items);
    }

    @Operation(summary = "Approve leave request")
    @PatchMapping("/{id}/approve")
    public ApiResponse<LeaveRequestResponse> approve(
            @PathVariable UUID schoolId,
            @PathVariable UUID id,
            @RequestBody(required = false) ReviewRequest req) {

        LeaveRequest lr = resolveRequest(schoolId, id);
        if (lr.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be approved");
        }
        lr.approve(RequestContext.getUserId(), req != null ? req.notes() : null);
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                LeaveRequestResponse.from(leaveRepo.save(lr)));
    }

    @Operation(summary = "Reject leave request")
    @PatchMapping("/{id}/reject")
    public ApiResponse<LeaveRequestResponse> reject(
            @PathVariable UUID schoolId,
            @PathVariable UUID id,
            @RequestBody(required = false) ReviewRequest req) {

        LeaveRequest lr = resolveRequest(schoolId, id);
        if (lr.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be rejected");
        }
        lr.reject(RequestContext.getUserId(), req != null ? req.notes() : null);
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                LeaveRequestResponse.from(leaveRepo.save(lr)));
    }

    @Operation(summary = "Cancel leave request (PENDING only)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable UUID schoolId,
            @PathVariable UUID id) {

        LeaveRequest lr = resolveRequest(schoolId, id);
        if (lr.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be cancelled");
        }
        lr.cancel();
        leaveRepo.save(lr);
        return ResponseEntity.noContent().build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateSchool(UUID schoolId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .filter(s -> s.getId().equals(schoolId))
                .orElseThrow(() -> new NotFoundException("School not found"));
    }

    private LeaveRequest resolveRequest(UUID schoolId, UUID id) {
        validateSchool(schoolId);
        return leaveRepo.findBySchoolIdAndId(schoolId, id)
                .orElseThrow(() -> new NotFoundException("Leave request not found"));
    }
}
