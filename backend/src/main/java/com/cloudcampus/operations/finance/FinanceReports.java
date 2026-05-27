package com.cloudcampus.operations.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

record FinanceReportSummaryResponse(
        BigDecimal totalDemanded,
        BigDecimal totalCollected,
        BigDecimal totalOutstanding,
        long demandCount,
        long receiptCount,
        long openDemandCount,
        long partiallyPaidDemandCount,
        long paidDemandCount
) {
}

record FinanceCollectionResponse(
        List<FinanceCollectionRowResponse> items
) {
}

record FinanceCollectionRowResponse(
        LocalDate date,
        BigDecimal totalCollected,
        long receiptCount
) {
}
