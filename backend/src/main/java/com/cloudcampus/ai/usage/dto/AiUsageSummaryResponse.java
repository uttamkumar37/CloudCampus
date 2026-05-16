package com.cloudcampus.ai.usage.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Per-tenant AI usage summary for the current calendar month (CC-1605).
 */
public record AiUsageSummaryResponse(
        UUID    tenantId,
        Instant periodStart,           // start of the current calendar month (UTC)
        long    tokensThisMonth,       // input + output tokens (successful calls only)
        long    requestsThisMonth,
        long    requestsToday,
        long    monthlyTokenBudget,    // 0 = unlimited
        long    dailyRequestLimit,     // 0 = unlimited
        Integer budgetUtilisationPct   // null when budget is unlimited
) {
    public static AiUsageSummaryResponse of(UUID tenantId, Instant periodStart,
                                             long tokensThisMonth, long requestsThisMonth,
                                             long requestsToday,
                                             long monthlyTokenBudget, long dailyRequestLimit) {
        Integer pct = (monthlyTokenBudget > 0)
                ? (int) Math.min(100, tokensThisMonth * 100L / monthlyTokenBudget)
                : null;
        return new AiUsageSummaryResponse(tenantId, periodStart, tokensThisMonth,
                requestsThisMonth, requestsToday, monthlyTokenBudget, dailyRequestLimit, pct);
    }
}
