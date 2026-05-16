package com.cloudcampus.auth.service;

import com.cloudcampus.auth.dto.DeviceSessionResponse;

import java.util.List;
import java.util.UUID;

public interface DeviceSessionService {

    void register(UUID userId, UUID tenantId, String userAgent, String ipAddress);

    List<DeviceSessionResponse> listActive(UUID userId);

    void revoke(UUID sessionId, UUID userId);
}
