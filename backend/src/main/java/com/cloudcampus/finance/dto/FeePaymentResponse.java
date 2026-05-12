package com.cloudcampus.finance.dto;

import com.cloudcampus.finance.entity.FeePayment;
import com.cloudcampus.finance.entity.PaymentMode;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record FeePaymentResponse(
        UUID        id,
        UUID        studentFeeRecordId,
        BigDecimal  amount,
        LocalDate   paymentDate,
        PaymentMode paymentMode,
        String      referenceNumber,
        String      receiptNumber,
        UUID        collectedByStaffId,
        String      remarks,
        Instant     createdAt
) {
    public static FeePaymentResponse from(FeePayment p) {
        return new FeePaymentResponse(
                p.getId(),
                p.getStudentFeeRecordId(),
                p.getAmount(),
                p.getPaymentDate(),
                p.getPaymentMode(),
                p.getReferenceNumber(),
                p.getReceiptNumber(),
                p.getCollectedByStaffId(),
                p.getRemarks(),
                p.getCreatedAt()
        );
    }
}
