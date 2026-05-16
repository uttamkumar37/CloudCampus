package com.cloudcampus.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Razorpay gateway credentials.
 *
 * Set {@code enabled = false} in dev/test profiles to skip real API calls and use
 * mock order IDs. In production, all three fields must be non-empty.
 */
@ConfigurationProperties(prefix = "app.razorpay")
public record RazorpayProperties(
        String  keyId,
        String  keySecret,
        boolean enabled
) {}
