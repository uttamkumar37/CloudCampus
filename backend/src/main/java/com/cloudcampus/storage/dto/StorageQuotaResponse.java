package com.cloudcampus.storage.dto;

public record StorageQuotaResponse(
        long usedBytes,
        long limitBytes,
        long remainingBytes,
        Integer utilizationPercent
) {
}
