package com.cloudcampus.common.exception;

/**
 * Thrown when authentication fails — invalid credentials, expired token, or missing token
 * on a protected endpoint.
 *
 * Maps to HTTP 401 in RestExceptionHandler.
 *
 * SECURITY: Messages must NEVER reveal whether the username or the password was wrong.
 * Always use a generic message such as "Invalid credentials".
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
