package com.cloudcampus.subscription.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.subscription.dto.PlanChangePreviewResponse;
import com.cloudcampus.subscription.dto.PlanChangeRequest;
import com.cloudcampus.subscription.dto.SubscriptionPlanResponse;
import com.cloudcampus.subscription.dto.TenantSubscriptionResponse;
import com.cloudcampus.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * T-04 / T-21 (scaffold): customer-facing subscription self-serve endpoints.
 *
 * Scope of THIS scaffold:
 *   ✓ Routes wired with correct @PreAuthorize.
 *   ✓ Tenant resolved from RequestContext (not from URL) so customers can
 *     only operate on their own subscription.
 *   ✓ DTOs defined.
 *   ✓ List/get endpoints delegate to existing SubscriptionService.
 *   ✗ Proration math, Razorpay order creation, invoice PDF generation are
 *     intentionally left to a follow-up task. They throw
 *     `UnsupportedOperationException("not implemented")` so any client that
 *     calls them fails loud rather than receiving misleading data.
 *
 * Public plan listing for marketing pages — see PublicPlanController.
 */
@RestController
@RequestMapping("/v1/tenant/subscription")
@PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('TENANT_ADMIN')")
@Tag(name = "Tenant — Subscription",
     description = "Customer-facing subscription self-serve (T-04)")
public class TenantSubscriptionController {

    private final SubscriptionService subscriptionService;

    public TenantSubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    /** GET /v1/tenant/subscription — read the caller's current plan. */
    @Operation(summary = "Get the current tenant's subscription")
    @GetMapping
    public ApiResponse<TenantSubscriptionResponse> getMySubscription() {
        UUID tenantId = currentTenantId();
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                subscriptionService.getSubscription(tenantId));
    }

    /** GET /v1/tenant/subscription/plans — plans available to upgrade/downgrade to. */
    @Operation(summary = "List plans available to the current tenant")
    @GetMapping("/plans")
    public ApiResponse<List<SubscriptionPlanResponse>> listAvailablePlans() {
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY),
                subscriptionService.listPlans());
    }

    /**
     * POST /v1/tenant/subscription/preview — preview what changing to a plan
     * would cost (proration, next invoice).
     *
     * Returns a placeholder until proration logic is implemented (see
     * docs/INVOICE_REFUND_GST_ROADMAP.md).
     */
    @Operation(summary = "Preview a plan change (proration + next invoice)")
    @PostMapping("/preview")
    public ApiResponse<PlanChangePreviewResponse> preview(@Valid @RequestBody PlanChangeRequest request) {
        // SCAFFOLD: real proration math lives here in the follow-up task.
        throw new UnsupportedOperationException(
                "Plan-change preview is not implemented yet (T-04 follow-up). "
                + "Request was for plan=" + request.targetPlan() + ".");
    }

    /**
     * POST /v1/tenant/subscription/upgrade — initiate a paid upgrade.
     *
     * In the final implementation this returns a Razorpay order id + amount
     * so the frontend can launch the checkout overlay.
     */
    @Operation(summary = "Initiate an upgrade to a new plan")
    @PostMapping("/upgrade")
    public ApiResponse<Void> upgrade(@Valid @RequestBody PlanChangeRequest request) {
        throw new UnsupportedOperationException(
                "Self-serve upgrade is not implemented yet (T-04 follow-up). "
                + "Target plan: " + request.targetPlan() + ".");
    }

    /** POST /v1/tenant/subscription/cancel — schedule cancellation at period end. */
    @Operation(summary = "Schedule cancellation at the end of the current billing period")
    @PostMapping("/cancel")
    public ApiResponse<Void> cancel() {
        throw new UnsupportedOperationException(
                "Self-serve cancellation is not implemented yet (T-04 follow-up).");
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private UUID currentTenantId() {
        String t = RequestContext.getTenantId();
        if (t == null || t.isBlank()) {
            throw new BadRequestException("Tenant context is required");
        }
        return UUID.fromString(t);
    }
}
