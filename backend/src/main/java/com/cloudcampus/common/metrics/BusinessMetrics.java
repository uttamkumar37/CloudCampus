package com.cloudcampus.common.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * H-13: Centralised business metrics — single place for all application-level
 * Micrometer counters/summaries so names and tags stay consistent across services.
 *
 * Exposed in Prometheus as:
 *   cloudcampus_auth_logins_total{result="success|failure|rate_limited|locked_out"}
 *   cloudcampus_finance_payments_total{mode="CASH|ONLINE|BANK_TRANSFER|..."}
 *   cloudcampus_finance_payment_amount{} (INR, DistributionSummary)
 */
@Component
public class BusinessMetrics {

    // ── Auth ──────────────────────────────────────────────────────────────────

    private final Counter loginSuccess;
    private final Counter loginFailure;
    private final Counter loginRateLimited;
    private final Counter loginLockedOut;

    // ── Finance ───────────────────────────────────────────────────────────────

    private final Counter paymentsCash;
    private final Counter paymentsOnline;
    private final Counter paymentsOther;
    private final DistributionSummary paymentAmountSummary;

    public BusinessMetrics(MeterRegistry registry) {
        loginSuccess     = counter(registry, "cloudcampus.auth.logins", "result", "success");
        loginFailure     = counter(registry, "cloudcampus.auth.logins", "result", "failure");
        loginRateLimited = counter(registry, "cloudcampus.auth.logins", "result", "rate_limited");
        loginLockedOut   = counter(registry, "cloudcampus.auth.logins", "result", "locked_out");

        paymentsCash     = counter(registry, "cloudcampus.finance.payments", "mode", "CASH");
        paymentsOnline   = counter(registry, "cloudcampus.finance.payments", "mode", "ONLINE");
        paymentsOther    = counter(registry, "cloudcampus.finance.payments", "mode", "OTHER");

        paymentAmountSummary = DistributionSummary
                .builder("cloudcampus.finance.payment.amount")
                .description("Fee payment amounts recorded (INR)")
                .baseUnit("INR")
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(registry);
    }

    // ── Auth methods ──────────────────────────────────────────────────────────

    public void recordLoginSuccess()     { loginSuccess.increment(); }
    public void recordLoginFailure()     { loginFailure.increment(); }
    public void recordLoginRateLimited() { loginRateLimited.increment(); }
    public void recordLoginLockedOut()   { loginLockedOut.increment(); }

    // ── Finance methods ───────────────────────────────────────────────────────

    public void recordPayment(String mode, BigDecimal amount) {
        switch (mode) {
            case "CASH"   -> paymentsCash.increment();
            case "ONLINE" -> paymentsOnline.increment();
            default       -> paymentsOther.increment();
        }
        if (amount != null) {
            paymentAmountSummary.record(amount.doubleValue());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Counter counter(MeterRegistry r, String name, String tagKey, String tagValue) {
        return Counter.builder(name)
                .tag(tagKey, tagValue)
                .register(r);
    }
}
