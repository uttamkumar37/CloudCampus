package com.cloudcampus.finance.dto;

import com.cloudcampus.finance.entity.FeePayment;
import com.cloudcampus.finance.entity.FeeStatus;
import com.cloudcampus.finance.entity.PaymentMode;
import com.cloudcampus.finance.entity.StudentFeeRecord;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Full receipt view — the student fee record plus all its payment transactions.
 * Used for CC-0905 receipt generation.
 */
public record FeeReceiptResponse(
        UUID             recordId,
        UUID             studentId,
        String           categoryName,
        BigDecimal       amountDue,
        BigDecimal       discount,
        BigDecimal       amountPaid,
        BigDecimal       balance,
        FeeStatus        status,
        LocalDate        dueDate,
        List<PaymentLine> payments
) {
    public record PaymentLine(
            UUID        paymentId,
            BigDecimal  amount,
            LocalDate   paymentDate,
            PaymentMode paymentMode,
            String      referenceNumber,
            String      receiptNumber,
            String      remarks
    ) {
        public static PaymentLine from(FeePayment p) {
            return new PaymentLine(
                    p.getId(),
                    p.getAmount(),
                    p.getPaymentDate(),
                    p.getPaymentMode(),
                    p.getReferenceNumber(),
                    p.getReceiptNumber(),
                    p.getRemarks()
            );
        }
    }

    public static FeeReceiptResponse from(StudentFeeRecord r,
                                          String categoryName,
                                          List<FeePayment> payments) {
        BigDecimal balance = r.getAmountDue()
                .subtract(r.getDiscount())
                .subtract(r.getAmountPaid());
        return new FeeReceiptResponse(
                r.getId(),
                r.getStudentId(),
                categoryName,
                r.getAmountDue(),
                r.getDiscount(),
                r.getAmountPaid(),
                balance,
                r.getStatus(),
                r.getDueDate(),
                payments.stream().map(PaymentLine::from).toList()
        );
    }
}
