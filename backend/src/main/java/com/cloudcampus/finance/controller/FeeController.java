package com.cloudcampus.finance.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.finance.dto.CreateFeeCategoryRequest;
import com.cloudcampus.finance.dto.CreateFeeStructureRequest;
import com.cloudcampus.finance.dto.CreateStudentFeeRecordRequest;
import com.cloudcampus.finance.dto.FeeCategoryResponse;
import com.cloudcampus.finance.dto.FeePaymentResponse;
import com.cloudcampus.finance.dto.FeeReceiptResponse;
import com.cloudcampus.finance.dto.FeeStructureResponse;
import com.cloudcampus.finance.dto.RecordPaymentRequest;
import com.cloudcampus.finance.dto.StudentFeeRecordResponse;
import com.cloudcampus.finance.entity.FeeStatus;
import com.cloudcampus.finance.service.FeeInvoicePdfService;
import com.cloudcampus.finance.service.FeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * School Admin API — Finance & Fees (CC-0901 / CC-0902 / CC-0905).
 *
 * Fee Categories:
 *   POST  /v1/school-admin/schools/{schoolId}/fee-categories
 *   GET   /v1/school-admin/schools/{schoolId}/fee-categories[?activeOnly=true]
 *   PATCH /v1/school-admin/fee-categories/{categoryId}/deactivate
 *
 * Fee Structures:
 *   POST  /v1/school-admin/schools/{schoolId}/fee-structures
 *   GET   /v1/school-admin/schools/{schoolId}/fee-structures?academicYearId=
 *
 * Student Fee Records (Invoices):
 *   POST  /v1/school-admin/schools/{schoolId}/fee-records
 *   GET   /v1/school-admin/students/{studentId}/fee-records[?academicYearId=]
 *   GET   /v1/school-admin/schools/{schoolId}/fee-records?academicYearId=[&status=]
 *   GET   /v1/school-admin/fee-records/{recordId}
 *   PATCH /v1/school-admin/fee-records/{recordId}/waive
 *
 * Payments:
 *   POST  /v1/school-admin/fee-records/{recordId}/payments
 *
 * Receipt (CC-0905):
 *   GET   /v1/school-admin/fee-records/{recordId}/receipt
 *
 * Security: SCHOOL_ADMIN, TENANT_ADMIN, SUPER_ADMIN (SecurityConfig path rule).
 */
@RestController
@RequestMapping("/v1/school-admin")
@Tag(name = "School Admin — Finance",
     description = "Fee structure engine, fee collection, and receipt generation")
public class FeeController {

    private final FeeService           service;
    private final FeeInvoicePdfService invoicePdfService;

    public FeeController(FeeService service, FeeInvoicePdfService invoicePdfService) {
        this.service           = service;
        this.invoicePdfService = invoicePdfService;
    }

    // ── Fee Categories ───────────────────────────────────────────────────────

    @Operation(summary = "Create a fee category",
               description = "Adds a named fee head (e.g. Tuition, Library) for a school.")
    @PostMapping("/schools/{schoolId}/fee-categories")
    public ResponseEntity<ApiResponse<FeeCategoryResponse>> createCategory(
            @PathVariable UUID schoolId,
            @Valid @RequestBody CreateFeeCategoryRequest request) {
        FeeCategoryResponse body = service.createCategory(schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List fee categories for a school")
    @GetMapping("/schools/{schoolId}/fee-categories")
    public ResponseEntity<ApiResponse<List<FeeCategoryResponse>>> listCategories(
            @PathVariable UUID schoolId,
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<FeeCategoryResponse> body = service.listCategories(schoolId, activeOnly);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "Deactivate a fee category")
    @PatchMapping("/fee-categories/{categoryId}/deactivate")
    public ResponseEntity<ApiResponse<FeeCategoryResponse>> deactivateCategory(
            @PathVariable UUID categoryId) {
        FeeCategoryResponse body = service.deactivateCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    // ── Fee Structures ───────────────────────────────────────────────────────

    @Operation(summary = "Create a fee structure",
               description = "Defines the amount charged for a fee category in an academic year, "
                             + "optionally scoped to a specific class.")
    @PostMapping("/schools/{schoolId}/fee-structures")
    public ResponseEntity<ApiResponse<FeeStructureResponse>> createStructure(
            @PathVariable UUID schoolId,
            @Valid @RequestBody CreateFeeStructureRequest request) {
        FeeStructureResponse body = service.createStructure(schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List fee structures for a school and academic year")
    @GetMapping("/schools/{schoolId}/fee-structures")
    public ResponseEntity<ApiResponse<List<FeeStructureResponse>>> listStructures(
            @PathVariable UUID schoolId,
            @RequestParam(required = false) UUID academicYearId) {
        List<FeeStructureResponse> body = service.listStructures(schoolId, academicYearId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    // ── Student Fee Records ──────────────────────────────────────────────────

    @Operation(summary = "Generate a student fee record (invoice)",
               description = "Creates a per-student fee invoice from an existing fee structure.")
    @PostMapping("/schools/{schoolId}/fee-records")
    public ResponseEntity<ApiResponse<StudentFeeRecordResponse>> createRecord(
            @PathVariable UUID schoolId,
            @Valid @RequestBody CreateStudentFeeRecordRequest request) {
        StudentFeeRecordResponse body = service.createRecord(schoolId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List fee records for a student")
    @GetMapping("/students/{studentId}/fee-records")
    public ResponseEntity<ApiResponse<List<StudentFeeRecordResponse>>> listRecordsByStudent(
            @PathVariable UUID studentId,
            @RequestParam(required = false) UUID academicYearId) {
        List<StudentFeeRecordResponse> body = service.listRecordsByStudent(studentId, academicYearId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "List all fee records for a school in an academic year")
    @GetMapping("/schools/{schoolId}/fee-records")
    public ResponseEntity<ApiResponse<List<StudentFeeRecordResponse>>> listRecordsBySchool(
            @PathVariable UUID schoolId,
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) FeeStatus status) {
        List<StudentFeeRecordResponse> body = service.listRecordsBySchool(schoolId, academicYearId, status);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "Get a single fee record")
    @GetMapping("/fee-records/{recordId}")
    public ResponseEntity<ApiResponse<StudentFeeRecordResponse>> getRecord(
            @PathVariable UUID recordId) {
        StudentFeeRecordResponse body = service.getRecord(recordId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "Waive a fee record")
    @PatchMapping("/fee-records/{recordId}/waive")
    public ResponseEntity<ApiResponse<StudentFeeRecordResponse>> waiveRecord(
            @PathVariable UUID recordId) {
        StudentFeeRecordResponse body = service.waiveRecord(recordId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    // ── Payments ─────────────────────────────────────────────────────────────

    @Operation(summary = "Record a payment against a fee record",
               description = "Records a fee payment transaction and updates the invoice status. "
                             + "A unique receipt number is auto-generated.")
    @PostMapping("/fee-records/{recordId}/payments")
    public ResponseEntity<ApiResponse<FeePaymentResponse>> recordPayment(
            @PathVariable UUID recordId,
            @Valid @RequestBody RecordPaymentRequest request) {
        FeePaymentResponse body = service.recordPayment(recordId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    // ── Receipt (CC-0905) ────────────────────────────────────────────────────

    @Operation(summary = "Get fee receipt for a student fee record",
               description = "Returns the full invoice with all payment transactions. "
                             + "Used for receipt printing (CC-0905).")
    @GetMapping("/fee-records/{recordId}/receipt")
    public ResponseEntity<ApiResponse<FeeReceiptResponse>> getReceipt(
            @PathVariable UUID recordId) {
        FeeReceiptResponse body = service.getReceipt(recordId);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    // ── Invoice PDF (CC-0904) ─────────────────────────────────────────────────

    @Operation(summary = "Download fee invoice as PDF",
               description = "Generates and streams a PDF invoice for the given fee record (CC-0904).")
    @GetMapping(value = "/fee-records/{recordId}/invoice", produces = "application/pdf")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable UUID recordId) {
        byte[] pdf = invoicePdfService.generate(recordId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("invoice-" + recordId + ".pdf")
                        .build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
