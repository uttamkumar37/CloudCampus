package com.cloudcampus.fees.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.fees.dto.FeeAssignmentCreateRequest;
import com.cloudcampus.fees.dto.FeeAssignmentResponse;
import com.cloudcampus.fees.dto.FeePaymentCreateRequest;
import com.cloudcampus.fees.dto.FeePaymentResponse;
import com.cloudcampus.fees.service.FeesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fees")
@RequiredArgsConstructor
@Tag(name = "Fees", description = "Fees and payments APIs")
public class FeesController {

    private final FeesService feesService;

    @PostMapping("/assignments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
        @Operation(summary = "Create fee assignment", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
        })
    public ResponseEntity<ApiResponse<FeeAssignmentResponse>> createFeeAssignment(
            @Valid @RequestBody FeeAssignmentCreateRequest request
    ) {
        FeeAssignmentResponse response = feesService.createFeeAssignment(request);
        return ResponseEntity.ok(ApiResponse.success("Fee assignment created successfully", response));
    }

    @PostMapping("/payments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
        @Operation(summary = "Record fee payment", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
        })
    public ResponseEntity<ApiResponse<FeePaymentResponse>> recordPayment(
            @Valid @RequestBody FeePaymentCreateRequest request
    ) {
        FeePaymentResponse response = feesService.recordFeePayment(request);
        return ResponseEntity.ok(ApiResponse.success("Fee payment recorded successfully", response));
    }

    @GetMapping("/students/{studentId}/assignments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER') or @ownershipChecker.canViewStudentData(authentication, #studentId)")
    @Operation(summary = "Get fee assignments by student", parameters = {
            @Parameter(name = "X-Tenant-Slug", description = "Tenant schema identifier", required = true),
            @Parameter(name = "Authorization", description = "Bearer JWT token", required = true)
    })
    public ResponseEntity<ApiResponse<List<FeeAssignmentResponse>>> getStudentFees(@PathVariable UUID studentId) {
        List<FeeAssignmentResponse> response = feesService.getFeeAssignmentsByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student fee assignments fetched successfully", response));
    }
}
