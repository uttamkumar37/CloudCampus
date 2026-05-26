package com.cloudcampus.common.web;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.exception.TooManyRequestsException;
import com.cloudcampus.common.exception.UnauthorizedException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    ResponseEntity<ApiErrorResponse> badRequest(BadRequestException ex) {
        return ResponseEntity.badRequest().body(ApiErrorResponse.of("BAD_REQUEST", ex.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    ResponseEntity<ApiErrorResponse> conflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiErrorResponse.of("CONFLICT", ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    ResponseEntity<ApiErrorResponse> unauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiErrorResponse.of("UNAUTHORIZED", ex.getMessage()));
    }

    @ExceptionHandler(TooManyRequestsException.class)
    ResponseEntity<ApiErrorResponse> tooManyRequests(TooManyRequestsException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(ApiErrorResponse.of("TOO_MANY_REQUESTS", ex.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    ResponseEntity<ApiErrorResponse> forbidden(ForbiddenException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiErrorResponse.of("FORBIDDEN", ex.getMessage()));
    }

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<ApiErrorResponse> notFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiErrorResponse.of("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiErrorResponse> validation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .orElse("Request validation failed.");
        return ResponseEntity.badRequest().body(ApiErrorResponse.of("VALIDATION_FAILED", message));
    }
}
