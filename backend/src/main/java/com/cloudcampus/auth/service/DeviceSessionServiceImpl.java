package com.cloudcampus.auth.service;

import com.cloudcampus.auth.dto.DeviceSessionResponse;
import com.cloudcampus.auth.entity.DeviceSession;
import com.cloudcampus.auth.repository.DeviceSessionRepository;
import com.cloudcampus.common.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DeviceSessionServiceImpl implements DeviceSessionService {

    private final DeviceSessionRepository repo;

    public DeviceSessionServiceImpl(DeviceSessionRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public void register(UUID userId, UUID tenantId, String userAgent, String ipAddress) {
        String deviceName = parseDeviceName(userAgent);
        DeviceSession session = DeviceSession.create(userId, tenantId, deviceName, ipAddress,
                truncate(userAgent, 512));
        repo.save(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceSessionResponse> listActive(UUID userId) {
        return repo.findByUserIdAndRevokedFalseOrderByLastSeenAtDesc(userId)
                .stream()
                .map(DeviceSessionResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void revoke(UUID sessionId, UUID userId) {
        DeviceSession session = repo.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new NotFoundException("Device session not found"));
        session.revoke();
        repo.save(session);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static String parseDeviceName(String ua) {
        if (ua == null || ua.isBlank()) return "Unknown Device";
        // Mobile apps
        if (ua.contains("ReactNative"))  return "Mobile App";
        // Browsers with OS
        String browser = extractBrowser(ua);
        String os      = extractOs(ua);
        return os.isEmpty() ? browser : browser + " on " + os;
    }

    private static String extractBrowser(String ua) {
        if (ua.contains("Edg/"))    return "Edge";
        if (ua.contains("OPR/"))    return "Opera";
        if (ua.contains("Chrome/")) return "Chrome";
        if (ua.contains("Firefox/"))return "Firefox";
        if (ua.contains("Safari/")) return "Safari";
        return "Browser";
    }

    private static String extractOs(String ua) {
        if (ua.contains("Windows NT"))   return "Windows";
        if (ua.contains("Macintosh"))    return "macOS";
        if (ua.contains("Android"))      return "Android";
        if (ua.contains("iPhone") || ua.contains("iPad")) return "iOS";
        if (ua.contains("Linux"))        return "Linux";
        return "";
    }

    private static String truncate(String s, int max) {
        return (s == null || s.length() <= max) ? s : s.substring(0, max);
    }
}
