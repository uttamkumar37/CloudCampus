package com.cloudcampus.common.web;

import com.cloudcampus.common.api.ApiError;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.FeatureNotEnabledException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.exception.TenantSuspendedException;
import com.cloudcampus.common.exception.TooManyRequestsException;
import com.cloudcampus.common.exception.UnauthorizedException;
import com.cloudcampus.common.exception.UsageLimitExceededException;
import com.cloudcampus.storage.StorageException;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(RestExceptionHandler.class);

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ApiError.of("NOT_FOUND", ex.getMessage()));
    }

    // C-05: UnauthorizedException → 401. Used for failed login and missing/invalid tokens.
    // SECURITY: Response body intentionally uses a generic message — never reveal which
    // field (username vs password) caused the failure to prevent user enumeration.
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        return build(HttpStatus.UNAUTHORIZED, ApiError.of("UNAUTHORIZED", ex.getMessage()));
    }

    // C-05: TooManyRequestsException → 429. Returned when the login rate limit is exceeded.
    // SECURITY: Never include remaining attempt count or retry-after in the body — use
    // a Retry-After header only if operational teams explicitly request it.
    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<ApiResponse<Void>> handleTooManyRequests(TooManyRequestsException ex) {
        return build(HttpStatus.TOO_MANY_REQUESTS, ApiError.of("TOO_MANY_REQUESTS", ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ApiError.of("BAD_REQUEST", ex.getMessage()));
    }

    // C-05: ConflictException → 409. Used for duplicate resource creation (e.g. duplicate tenant code).
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Void>> handleConflict(ConflictException ex) {
        return build(HttpStatus.CONFLICT, ApiError.of("CONFLICT", ex.getMessage()));
    }

    // C-05: ForbiddenException → 403. Used for permission and tenant access denials.
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbidden(ForbiddenException ex) {
        return build(HttpStatus.FORBIDDEN, ApiError.of("FORBIDDEN", ex.getMessage()));
    }

    // Feature flag enforcement — 403 with opaque message; featureKey is logged but not exposed.
    @ExceptionHandler(FeatureNotEnabledException.class)
    public ResponseEntity<ApiResponse<Void>> handleFeatureNotEnabled(FeatureNotEnabledException ex) {
        log.warn("Feature access denied: feature={}", ex.getFeatureKey());
        return build(HttpStatus.FORBIDDEN, ApiError.of("FEATURE_NOT_ENABLED", ex.getMessage()));
    }

    // C-05: TenantSuspendedException → 403. Never leaks internal tenant state to response body.
    @ExceptionHandler(TenantSuspendedException.class)
    public ResponseEntity<ApiResponse<Void>> handleTenantSuspended(TenantSuspendedException ex) {
        log.warn("Access attempt on non-active tenant: {}", ex.getTenantId());
        return build(HttpStatus.FORBIDDEN, ApiError.of("TENANT_SUSPENDED", "Tenant access is not permitted"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> details = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err -> fieldErrors.put(err.getField(), err.getDefaultMessage()));
        details.put("fields", fieldErrors);
        return build(HttpStatus.BAD_REQUEST, ApiError.of("VALIDATION_ERROR", "Validation failed", details));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException ex) {
        return build(HttpStatus.BAD_REQUEST, ApiError.of("VALIDATION_ERROR", ex.getMessage()));
    }

    @ExceptionHandler(StorageException.class)
    public ResponseEntity<ApiResponse<Void>> handleStorage(StorageException ex) {
        log.error("Storage error", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ApiError.of("STORAGE_ERROR", "File operation failed"));
    }

    @ExceptionHandler(UsageLimitExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleUsageLimit(UsageLimitExceededException ex) {
        log.warn("Usage limit exceeded: key={} current={} limit={}", ex.getLimitKey(), ex.getCurrent(), ex.getLimit());
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ApiError.of("USAGE_LIMIT_EXCEEDED", ex.getMessage()));
    }

    // C-01: Always log the full stack trace for unexpected exceptions so they appear in Loki/Grafana.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnknown(Exception ex) {
        log.error("Unexpected error [correlationId={}]", MDC.get(CorrelationId.MDC_KEY), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ApiError.of("INTERNAL_ERROR", "An unexpected error occurred"));
    }

    private ResponseEntity<ApiResponse<Void>> build(HttpStatus status, ApiError error) {
        String correlationId = MDC.get(CorrelationId.MDC_KEY);
        return ResponseEntity.status(status).body(ApiResponse.error(correlationId, error));
    }
}

