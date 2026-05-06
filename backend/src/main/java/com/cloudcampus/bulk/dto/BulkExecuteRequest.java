package com.cloudcampus.bulk.dto;

public record BulkExecuteRequest(
        String validationId,
        boolean autoCreateParentAccounts,
        boolean sendCredentials,
        boolean forcePasswordReset
) {
}
