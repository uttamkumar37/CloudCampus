package com.cloudcampus.payment.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Sent by the frontend after the Razorpay checkout popup completes successfully.
 * Backend verifies the HMAC signature before recording the payment.
 */
public record VerifyPaymentRequest(

        @NotBlank(message = "paymentOrderId is required")
        String paymentOrderId,

        @NotBlank(message = "razorpayOrderId is required")
        String razorpayOrderId,

        @NotBlank(message = "razorpayPaymentId is required")
        String razorpayPaymentId,

        @NotBlank(message = "razorpaySignature is required")
        String razorpaySignature
) {}
