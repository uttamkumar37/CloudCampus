package com.cloudcampus.payment.service;

import com.cloudcampus.finance.dto.FeePaymentResponse;
import com.cloudcampus.payment.dto.CreatePaymentOrderResponse;
import com.cloudcampus.payment.dto.VerifyPaymentRequest;

import java.util.UUID;

public interface PaymentService {

    /**
     * Creates a Razorpay payment order for the outstanding balance on a fee record.
     * In dev/test mode (razorpay.enabled=false) returns a mock order without calling the API.
     */
    CreatePaymentOrderResponse createOrder(UUID feeRecordId, UUID initiatedByUserId);

    /**
     * Verifies the Razorpay HMAC signature and records the payment against the fee record.
     * In dev/test mode the signature check is skipped.
     */
    FeePaymentResponse verifyAndCapture(VerifyPaymentRequest request);
}
