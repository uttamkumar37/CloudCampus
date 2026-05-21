package com.cloudcampus.auth.service;

import com.cloudcampus.auth.dto.DeviceSessionResponse;
import com.cloudcampus.auth.entity.DeviceSession;
import com.cloudcampus.auth.repository.DeviceSessionRepository;
import com.cloudcampus.common.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeviceSessionServiceImplTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID TENANT_ID = UUID.randomUUID();
    private static final String MAC_CHROME_UA =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                    + "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    @Mock
    DeviceSessionRepository repository;

    DeviceSessionServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new DeviceSessionServiceImpl(repository);
    }

    @Test
    void register_createsNewSessionWithParsedDeviceNameAndTenant() {
        when(repository.findFirstByUserIdAndDeviceNameAndIpAddressAndUserAgentAndRevokedFalseOrderByLastSeenAtDesc(
                USER_ID, "Chrome on macOS", "127.0.0.1", MAC_CHROME_UA))
                .thenReturn(Optional.empty());

        service.register(USER_ID, TENANT_ID, MAC_CHROME_UA, "127.0.0.1");

        ArgumentCaptor<DeviceSession> captor = ArgumentCaptor.forClass(DeviceSession.class);
        verify(repository).save(captor.capture());

        DeviceSession saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(USER_ID);
        assertThat(saved.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(saved.getDeviceName()).isEqualTo("Chrome on macOS");
        assertThat(saved.getIpAddress()).isEqualTo("127.0.0.1");
        assertThat(saved.getUserAgent()).isEqualTo(MAC_CHROME_UA);
        assertThat(saved.getLastSeenAt()).isNotNull();
        assertThat(saved.isRevoked()).isFalse();
    }

    @Test
    void register_supportsTenantlessPlatformSessionsAndTruncatesLongUserAgent() {
        String longUserAgent = "Chrome/120 " + "x".repeat(600);
        String truncated = longUserAgent.substring(0, 512);
        when(repository.findFirstByUserIdAndDeviceNameAndIpAddressAndUserAgentAndRevokedFalseOrderByLastSeenAtDesc(
                USER_ID, "Chrome", "::1", truncated))
                .thenReturn(Optional.empty());

        service.register(USER_ID, null, longUserAgent, "::1");

        ArgumentCaptor<DeviceSession> captor = ArgumentCaptor.forClass(DeviceSession.class);
        verify(repository).save(captor.capture());

        DeviceSession saved = captor.getValue();
        assertThat(saved.getTenantId()).isNull();
        assertThat(saved.getDeviceName()).isEqualTo("Chrome");
        assertThat(saved.getUserAgent()).hasSize(512);
        assertThat(saved.getUserAgent()).isEqualTo(truncated);
    }

    @Test
    void register_reusesExistingActiveSessionForSameDeviceFingerprint() {
        DeviceSession existing = session("Chrome on macOS", "127.0.0.1", MAC_CHROME_UA);
        when(repository.findFirstByUserIdAndDeviceNameAndIpAddressAndUserAgentAndRevokedFalseOrderByLastSeenAtDesc(
                USER_ID, "Chrome on macOS", "127.0.0.1", MAC_CHROME_UA))
                .thenReturn(Optional.of(existing));

        service.register(USER_ID, TENANT_ID, MAC_CHROME_UA, "127.0.0.1");

        verify(repository).save(existing);
        assertThat(existing.getLastSeenAt()).isNotNull();
    }

    @Test
    void listActive_deduplicatesDeviceFingerprintsAndLimitsToTen() {
        List<DeviceSession> sessions = new ArrayList<>();
        sessions.add(session("Chrome on macOS", "127.0.0.1", MAC_CHROME_UA));
        sessions.add(session("Chrome on macOS", "127.0.0.1", MAC_CHROME_UA));
        for (int i = 0; i < 11; i++) {
            sessions.add(session("Device-" + i, "10.0.0." + i, "Agent-" + i));
        }
        when(repository.findByUserIdAndRevokedFalseOrderByLastSeenAtDesc(USER_ID)).thenReturn(sessions);

        List<DeviceSessionResponse> active = service.listActive(USER_ID);

        assertThat(active).hasSize(10);
        assertThat(active)
                .filteredOn(response -> response.deviceName().equals("Chrome on macOS"))
                .hasSize(1);
        assertThat(active).extracting(DeviceSessionResponse::deviceName)
                .contains("Device-0", "Device-8")
                .doesNotContain("Device-9", "Device-10");
    }

    @Test
    void revoke_revokesOnlySessionOwnedByCurrentUser() {
        UUID sessionId = UUID.randomUUID();
        DeviceSession session = session("Chrome on macOS", "127.0.0.1", MAC_CHROME_UA);
        when(repository.findByIdAndUserId(sessionId, USER_ID)).thenReturn(Optional.of(session));

        service.revoke(sessionId, USER_ID);

        assertThat(session.isRevoked()).isTrue();
        assertThat(session.getRevokedAt()).isNotNull();
        verify(repository).save(session);
    }

    @Test
    void revoke_unknownSession_throwsNotFound() {
        UUID sessionId = UUID.randomUUID();
        when(repository.findByIdAndUserId(sessionId, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.revoke(sessionId, USER_ID))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Device session not found");
    }

    @Test
    void revokeAll_revokesAllActiveSessionsAndReturnsCount() {
        List<DeviceSession> sessions = List.of(
                session("Chrome on macOS", "127.0.0.1", MAC_CHROME_UA),
                session("Mobile App", "10.0.0.8", "ReactNative CloudCampus"));
        when(repository.findByUserIdAndRevokedFalseOrderByLastSeenAtDesc(USER_ID)).thenReturn(sessions);

        int revoked = service.revokeAll(USER_ID);

        assertThat(revoked).isEqualTo(2);
        assertThat(sessions).allMatch(DeviceSession::isRevoked);
        verify(repository).saveAll(sessions);
    }

    private static DeviceSession session(String deviceName, String ipAddress, String userAgent) {
        DeviceSession session = DeviceSession.create(USER_ID, TENANT_ID, deviceName, ipAddress, userAgent);
        session.markSeen();
        return session;
    }
}
