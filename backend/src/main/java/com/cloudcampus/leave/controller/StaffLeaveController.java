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
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.repository.StaffRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.slf4j.MDC;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
 * Staff self-service leave management (CC-0604 — teacher endpoint).
 *
 * GET    /v1/teacher/leave           — list own leave requests (newest first)
 * POST   /v1/teacher/leave           — submit a new leave request
 * DELETE /v1/teacher/leave/{id}      — cancel a PENDING request
 *
 * Security: TEACHER role only. staffId is always resolved from the authenticated
 * user's staff profile — never accepted from the client.
 */
@RestController
@RequestMapping("/v1/teacher/leave")
@PreAuthorize("hasRole('TEACHER')")
@Tag(name = "Teacher — Leave", description = "Staff self-service leave requests")
public class StaffLeaveController {

    public record SubmitRequest(
            @NotNull LeaveType  leaveType,
            @NotNull LocalDate  startDate,
            @NotNull LocalDate  endDate,
            @NotBlank String    reason
    ) {}

    private final LeaveRequestRepository leaveRepo;
    private final SchoolRepository       schoolRepo;
    private final StaffRepository        staffRepo;

    public StaffLeaveController(
            LeaveRequestRepository leaveRepo,
            SchoolRepository       schoolRepo,
            StaffRepository        staffRepo) {
        this.leaveRepo  = leaveRepo;
        this.schoolRepo = schoolRepo;
        this.staffRepo  = staffRepo;
    }

    @Operation(summary = "List my leave requests",
               description = "Returns the authenticated teacher's own leave requests, newest first.")
    @GetMapping
    public ApiResponse<List<LeaveRequestResponse>> myLeave(
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {

        ResolvedStaff ctx = resolve();
        List<LeaveRequestResponse> items = leaveRepo
                .findFiltered(ctx.school().getId(), status, ctx.staff().getId(),
                        PageRequest.of(page, size))
                .getContent().stream()
                .map(LeaveRequestResponse::from)
                .toList();

        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), items);
    }

    @Operation(summary = "Submit a leave request")
    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> submit(
            @Valid @RequestBody SubmitRequest req) {

        if (req.endDate().isBefore(req.startDate())) {
            throw new BadRequestException("end_date must be >= start_date");
        }

        ResolvedStaff ctx = resolve();
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());

        LeaveRequest lr = LeaveRequest.create(
                tenantId, ctx.school().getId(), ctx.staff().getId(),
                req.leaveType(), req.startDate(), req.endDate(), req.reason());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                        LeaveRequestResponse.from(leaveRepo.save(lr))));
    }

    @Operation(summary = "Cancel a pending leave request")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable UUID id) {
        ResolvedStaff ctx = resolve();

        LeaveRequest lr = leaveRepo.findBySchoolIdAndId(ctx.school().getId(), id)
                .filter(r -> r.getStaffId().equals(ctx.staff().getId()))
                .orElseThrow(() -> new NotFoundException("Leave request not found"));

        if (lr.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be cancelled");
        }
        lr.cancel();
        leaveRepo.save(lr);
        return ResponseEntity.noContent().build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private record ResolvedStaff(School school, Staff staff) {}

    private ResolvedStaff resolve() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        UUID userId   = RequestContext.getUserId();

        School school = schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));

        Staff staff = staffRepo.findBySchoolIdAndUserId(school.getId(), userId)
                .orElseThrow(() -> new NotFoundException("Staff profile not found for this account"));

        return new ResolvedStaff(school, staff);
    }
}
