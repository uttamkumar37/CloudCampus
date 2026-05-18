package com.cloudcampus.staff.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.staff.dto.CreateStaffRequest;
import com.cloudcampus.staff.dto.SchoolAdminMeResponse;
import com.cloudcampus.staff.dto.StaffResponse;
import com.cloudcampus.staff.dto.StaffSummaryResponse;
import com.cloudcampus.staff.dto.UpdateStaffRequest;
import com.cloudcampus.staff.entity.StaffStatus;
import com.cloudcampus.staff.entity.StaffType;
import com.cloudcampus.staff.service.StaffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * School Admin API — Staff & Teacher Management (CC-0601 / CC-0602).
 *
 * POST   /v1/school-admin/schools/{schoolId}/staff                  — create staff
 * GET    /v1/school-admin/schools/{schoolId}/staff                   — list (filtered)
 * GET    /v1/school-admin/departments/{deptId}/staff                 — list by dept
 * GET    /v1/school-admin/staff/{id}                                 — full profile
 * PUT    /v1/school-admin/staff/{id}                                 — update profile
 * PATCH  /v1/school-admin/staff/{id}/on-leave                       — mark on-leave
 * PATCH  /v1/school-admin/staff/{id}/return-from-leave              — return from leave
 * PATCH  /v1/school-admin/staff/{id}/resign                         — resign
 * PATCH  /v1/school-admin/staff/{id}/terminate                      — terminate
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN (SecurityConfig path rule).
 */
@RestController
@RequestMapping("/v1/school-admin")
@Tag(name = "School Admin — Staff", description = "Staff / teacher onboarding and profile management")
public class StaffController {

    private final StaffService service;

    public StaffController(StaffService service) {
        this.service = service;
    }

    @Operation(summary = "Create (onboard) a staff member",
               description = "employeeNumber is auto-generated if omitted.")
    @PostMapping("/schools/{schoolId}/staff")
    public ResponseEntity<ApiResponse<StaffResponse>> create(
            @PathVariable UUID schoolId,
            @Valid @RequestBody CreateStaffRequest request) {
        StaffResponse body = service.create(schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List staff for a school",
               description = "Filter by ?status= and/or ?type=. Add ?search= for name prefix search.")
    @GetMapping("/schools/{schoolId}/staff")
    public ResponseEntity<ApiResponse<List<StaffSummaryResponse>>> list(
            @PathVariable UUID schoolId,
            @RequestParam(required = false) StaffStatus status,
            @RequestParam(required = false) StaffType   type,
            @RequestParam(required = false) String      search) {

        List<StaffSummaryResponse> body;
        if (search != null && !search.isBlank()) {
            body = service.search(schoolId, search);
        } else if (type != null) {
            body = service.listBySchoolAndType(schoolId, type);
        } else if (status != null) {
            body = service.listBySchoolAndStatus(schoolId, status);
        } else {
            body = service.listBySchool(schoolId);
        }
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List staff in a department")
    @GetMapping("/departments/{departmentId}/staff")
    public ResponseEntity<ApiResponse<List<StaffSummaryResponse>>> listByDepartment(
            @PathVariable UUID departmentId) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.listByDepartment(departmentId)));
    }

    @Operation(summary = "Profile of the currently authenticated school admin")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<SchoolAdminMeResponse>> getMe() {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.getMe()));
    }

    @Operation(summary = "Get full staff profile")
    @GetMapping("/staff/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.getById(id)));
    }

    @Operation(summary = "Update staff profile")
    @PutMapping("/staff/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStaffRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.update(id, request)));
    }

    @Operation(summary = "Mark staff as on leave")
    @PatchMapping("/staff/{id}/on-leave")
    public ResponseEntity<ApiResponse<StaffResponse>> markOnLeave(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.markOnLeave(id)));
    }

    @Operation(summary = "Return staff from leave")
    @PatchMapping("/staff/{id}/return-from-leave")
    public ResponseEntity<ApiResponse<StaffResponse>> returnFromLeave(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.returnFromLeave(id)));
    }

    @Operation(summary = "Record voluntary resignation")
    @PatchMapping("/staff/{id}/resign")
    public ResponseEntity<ApiResponse<StaffResponse>> resign(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.resign(id)));
    }

    @Operation(summary = "Terminate staff (involuntary exit)")
    @PatchMapping("/staff/{id}/terminate")
    public ResponseEntity<ApiResponse<StaffResponse>> terminate(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), service.terminate(id)));
    }
}
