package com.cloudcampus.subscription.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.subscription.dto.InvoiceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * T-21 (scaffold): customer-facing subscription invoice endpoints.
 *
 * The real implementation must:
 *   • Emit an `Invoice` row when SubscriptionService.assignPlan is called.
 *   • Render the PDF (open-source PDFBox / iText, or remote like DocSpring).
 *   • Apply Indian GST per docs/INVOICE_REFUND_GST_ROADMAP.md.
 *
 * Until that's built, the list endpoint returns an empty page and the
 * by-id/PDF endpoints throw 501 Not Implemented.
 */
@RestController
@RequestMapping("/v1/tenant/invoices")
@PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('TENANT_ADMIN')")
@Validated
@Tag(name = "Tenant — Invoices",
     description = "Subscription invoices and receipts (T-21 scaffold)")
public class TenantInvoiceController {

    @Operation(summary = "List invoices for the current tenant")
    @GetMapping
    public ApiResponse<PageResponse<InvoiceResponse>> list(
            @RequestParam(defaultValue = "0")  @Min(0)          int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int limit) {

        currentTenantId();   // tenant-presence guard
        // SCAFFOLD: return an empty page so the customer's invoice UI renders.
        // Replace with a real repository query once the Invoice entity exists.
        PageResponse<InvoiceResponse> empty = new PageResponse<>(
                List.<InvoiceResponse>of(),
                page * limit,
                limit,
                0L);
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), empty);
    }

    @Operation(summary = "Get a single invoice by id")
    @GetMapping("/{id}")
    public ApiResponse<InvoiceResponse> getOne(@PathVariable UUID id) {
        currentTenantId();   // tenant-presence guard
        throw new UnsupportedOperationException(
                "Invoice retrieval is not implemented yet (T-21 follow-up). id=" + id);
    }

    @Operation(summary = "Download the invoice PDF",
               description = "Returns application/pdf with Content-Disposition: attachment.")
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID id) {
        currentTenantId();
        throw new UnsupportedOperationException(
                "Invoice PDF rendering is not implemented yet (T-21 follow-up). id=" + id);
    }

    private UUID currentTenantId() {
        String t = RequestContext.getTenantId();
        if (t == null || t.isBlank()) {
            throw new BadRequestException("Tenant context is required");
        }
        return UUID.fromString(t);
    }
}
