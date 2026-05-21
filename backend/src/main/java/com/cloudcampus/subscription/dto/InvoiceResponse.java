package com.cloudcampus.subscription.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Customer-facing invoice summary. The PDF body is fetched separately from
 * GET /v1/tenant/invoices/{id}/pdf.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record InvoiceResponse(
        UUID    id,
        UUID    tenantId,
        String  invoiceNumber,
        String  status,            // DRAFT, ISSUED, PAID, VOID
        Instant issuedAt,
        Instant paidAt,
        Instant periodStart,
        Instant periodEnd,
        long    subtotalPaise,
        long    taxPaise,
        long    totalPaise,
        BigDecimal totalRupees,
        String  currency,
        String  pdfUrl
) {}
