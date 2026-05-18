package com.cloudcampus.notification.service;

import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.notification.dto.DeviceRegisterRequest;
import com.cloudcampus.notification.entity.DeviceToken;
import com.cloudcampus.notification.repository.DeviceTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class DeviceTokenServiceImpl implements DeviceTokenService {

    private static final Logger log = LoggerFactory.getLogger(DeviceTokenServiceImpl.class);

    private final DeviceTokenRepository deviceTokenRepository;

    public DeviceTokenServiceImpl(DeviceTokenRepository deviceTokenRepository) {
        this.deviceTokenRepository = deviceTokenRepository;
    }

    /**
     * Upserts the device token:
     *  - If a row for (userId, pushToken) already exists, refresh its metadata.
     *  - Otherwise insert a new row.
     *
     * This keeps the table tidy when a user re-logs in on the same device.
     */
    @Override
    @Transactional
    public void registerToken(UUID userId, DeviceRegisterRequest request) {
        DeviceToken token = deviceTokenRepository
                .findByUserIdAndPushToken(userId, request.pushToken())
                .orElseGet(DeviceToken::new);

        String rawTenantId = RequestContext.getTenantId();
        if (rawTenantId != null) token.setTenantId(UUID.fromString(rawTenantId));
        token.setUserId(userId);
        token.setPushToken(request.pushToken());
        token.setPlatform(request.platform());
        token.setExpoPushToken(request.expoPushToken());
        token.setDeviceFingerprint(request.deviceFingerprint());

        deviceTokenRepository.save(token);

        log.debug("Registered push token for user={} platform={}", userId, request.platform());
    }
}
