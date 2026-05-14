package com.cloudcampus.common.ratelimit;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a controller method as subject to per-user and per-tenant API rate limiting (CC-1805).
 *
 * Apply to endpoints that perform expensive work (report generation, CSV exports,
 * cross-school aggregation queries). The limits are configured globally via
 * app.rate-limit.api.* in application.yml; the annotation simply opts the method in.
 *
 * Enforcement is done by {@link RateLimitInterceptor} using Redis sliding-window counters.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimit {}
