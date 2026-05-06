package com.cloudcampus.common.exception;

/**
 * Thrown when a requested resource cannot be found in the data store.
 * Maps to HTTP 404 Not Found via {@link GlobalExceptionHandler}.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException of(String entity, Object id) {
        return new ResourceNotFoundException(entity + " not found: " + id);
    }
}
