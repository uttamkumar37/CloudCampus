package com.cloudcampus.feature.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a controller method (or class) as requiring a specific feature flag to be enabled
 * for the current tenant.
 *
 * <p>When the feature is not enabled, the AOP interceptor throws
 * {@link com.cloudcampus.common.exception.FeatureNotEnabledException} which translates
 * to an HTTP 403 response.
 *
 * <p>Super Admin requests (tenantId == null) bypass this check — all features are available.
 *
 * <pre>{@code
 * @RequiresFeature("ATTENDANCE_QR")
 * @GetMapping("/qr-attendance")
 * public ResponseEntity<?> getQrAttendance() { ... }
 * }</pre>
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresFeature {

    /** The feature key that must be enabled (e.g. "ATTENDANCE_QR"). */
    String value();
}
