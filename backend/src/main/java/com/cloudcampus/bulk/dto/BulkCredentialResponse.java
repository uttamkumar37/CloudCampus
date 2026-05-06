package com.cloudcampus.bulk.dto;

public record BulkCredentialResponse(
        String entityType,
        String identifier,
        String fullName,
        String username,
        String temporaryPassword,
        String action
) {
}
