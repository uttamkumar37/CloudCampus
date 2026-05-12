package com.cloudcampus.common.exception;

/**
 * Thrown when a client exceeds a rate limit (e.g. too many login attempts).
 *
 * Maps to HTTP 429 Too Many Requests in RestExceptionHandler.
 *
 * SECURITY: The message must not reveal how close the client is to the limit
 * or what the exact limit is — only a generic retry message is acceptable.
 */
public class TooManyRequestsException extends RuntimeException {

    public TooManyRequestsException(String message) {
        super(message);
    }
}
