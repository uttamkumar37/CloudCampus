package com.cloudcampus.operations.finance;

import java.util.List;

import com.cloudcampus.common.context.RequestContextResolver;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FeeController {

    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final RequestContextResolver requestContextResolver;
    private final FeeService feeService;

    public FeeController(
            AuthenticatedUserResolver authenticatedUserResolver,
            RequestContextResolver requestContextResolver,
            FeeService feeService
    ) {
        this.authenticatedUserResolver = authenticatedUserResolver;
        this.requestContextResolver = requestContextResolver;
        this.feeService = feeService;
    }

    @PostMapping("/v1/school-admin/fees/demands")
    ResponseEntity<FeeDemandResponse> createDemand(
            @Valid @RequestBody FeeDemandRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeService.createDemand(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @PostMapping("/v1/finance/fees/demands")
    ResponseEntity<FeeDemandResponse> createFinanceDemand(
            @Valid @RequestBody FeeDemandRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeService.createDemand(
                authenticatedUserResolver.requireUser(request),
                requestBody
        ));
    }

    @GetMapping("/v1/school-admin/fees/demands")
    ResponseEntity<List<FeeDemandResponse>> schoolDemands(HttpServletRequest request) {
        return ResponseEntity.ok(feeService.schoolDemands(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/finance/fees/demands")
    ResponseEntity<List<FeeDemandResponse>> financeDemands(HttpServletRequest request) {
        return ResponseEntity.ok(feeService.schoolDemands(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/school-admin/fees/demands/{demandId}")
    ResponseEntity<FeeDemandResponse> schoolDemand(@PathVariable String demandId, HttpServletRequest request) {
        return ResponseEntity.ok(feeService.schoolDemand(authenticatedUserResolver.requireUser(request), demandId));
    }

    @GetMapping("/v1/finance/fees/demands/{demandId}")
    ResponseEntity<FeeDemandResponse> financeDemand(@PathVariable String demandId, HttpServletRequest request) {
        return ResponseEntity.ok(feeService.schoolDemand(authenticatedUserResolver.requireUser(request), demandId));
    }

    @GetMapping("/v1/finance/receipts")
    ResponseEntity<PageResponse<FinanceReceiptResponse>> financeReceipts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(feeService.financeReceipts(authenticatedUserResolver.requireUser(request), page, size));
    }

    @GetMapping("/v1/finance/reports/summary")
    ResponseEntity<FinanceReportSummaryResponse> financeReportSummary(HttpServletRequest request) {
        return ResponseEntity.ok(feeService.financeReportSummary(authenticatedUserResolver.requireUser(request)));
    }

    @GetMapping("/v1/finance/reports/collections")
    ResponseEntity<FinanceCollectionResponse> financeCollections(HttpServletRequest request) {
        return ResponseEntity.ok(feeService.financeCollections(authenticatedUserResolver.requireUser(request)));
    }

    @PostMapping("/v1/school-admin/fees/demands/{demandId}/payments")
    ResponseEntity<FeeDemandResponse> recordSchoolPayment(
            @PathVariable String demandId,
            @Valid @RequestBody FeePaymentRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeService.recordSchoolPayment(
                authenticatedUserResolver.requireUser(request),
                demandId,
                requestBody
        ));
    }

    @PostMapping("/v1/finance/fees/demands/{demandId}/payments")
    ResponseEntity<FeeDemandResponse> recordFinancePayment(
            @PathVariable String demandId,
            @Valid @RequestBody FeePaymentRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeService.recordSchoolPayment(
                authenticatedUserResolver.requireUser(request),
                demandId,
                requestBody
        ));
    }

    @GetMapping("/v1/parent/children/{studentId}/fees")
    ResponseEntity<List<FeeDemandResponse>> parentChildFees(
            @PathVariable String studentId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(feeService.parentChildFees(
                requestContextResolver.requireContext(request),
                studentId
        ));
    }

    @PostMapping("/v1/parent/children/{studentId}/fees/{demandId}/payments")
    ResponseEntity<FeeDemandResponse> recordParentPayment(
            @PathVariable String studentId,
            @PathVariable String demandId,
            @Valid @RequestBody FeePaymentRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeService.recordParentPayment(
                requestContextResolver.requireContext(request),
                studentId,
                demandId,
                requestBody
        ));
    }

    @GetMapping("/v1/student/fees")
    ResponseEntity<List<FeeDemandResponse>> studentFees(HttpServletRequest request) {
        return ResponseEntity.ok(feeService.studentFees(requestContextResolver.requireContext(request)));
    }
}
