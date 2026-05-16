package com.cloudcampus.payment.dto;

import java.util.UUID;

/**
 * Returned to the frontend after a payment order is created.
 * The frontend passes these values directly to the Razorpay checkout SDK.
 */
public record CreatePaymentOrderResponse(
        UUID   paymentOrderId,   // our internal payment_orders.id
        String gatewayOrderId,   // Razorpay order_id  (prefixed rzp_*  or "mock_*" in dev)
        long   amountPaise,      // amount in paise (INR × 100)
        String currency,
        String keyId,            // public Razorpay key_id for the checkout widget
        String prefillName,
        String prefillEmail,
        String prefillContact
) {}
