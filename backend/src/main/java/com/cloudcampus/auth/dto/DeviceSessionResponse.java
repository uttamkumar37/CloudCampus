package com.cloudcampus.auth.dto;

import com.cloudcampus.auth.entity.DeviceSession;

import java.time.Instant;
import java.util.UUID;

public record DeviceSessionResponse(
        UUID    id,
        String  deviceName,
        String  ipAddress,
        Instant lastSeenAt,
        Instant createdAt,
        boolean revoked
) {
    public static DeviceSessionResponse from(DeviceSession ds) {
        return new DeviceSessionResponse(
                ds.getId(),
                ds.getDeviceName(),
                ds.getIpAddress(),
                ds.getLastSeenAt(),
                ds.getCreatedAt(),
                ds.isRevoked()
        );
    }
}
