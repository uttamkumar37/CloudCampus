package com.cloudcampus.notification.service;

import com.cloudcampus.notification.dto.DeviceRegisterRequest;

import java.util.UUID;

/**
 * Manages device push token lifecycle.
 */
public interface DeviceTokenService {

    /**
     * Registers or refreshes the push token for a given user/device.
     * Performs an upsert: existing token is updated; new token is inserted.
     *
     * @param userId  authenticated user's UUID
     * @param request validated push token + platform payload
     */
    void registerToken(UUID userId, DeviceRegisterRequest request);
}
