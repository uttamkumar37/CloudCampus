package com.cloudcampus.experience;

import com.cloudcampus.auth.entity.User;
import com.cloudcampus.auth.entity.UserRole;
import com.cloudcampus.auth.entity.UserStatus;
import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.audit.InvestorRoomAccessEvent;
import com.cloudcampus.experience.audit.InvestorRoomAccessLog;
import com.cloudcampus.experience.audit.InvestorRoomAccessLogRepository;
import com.cloudcampus.experience.entity.InvestorRoom;
import com.cloudcampus.experience.repository.InvestorRoomRepository;
import com.cloudcampus.experience.service.InvestorRoomService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * TASK-019 — Investor room access audit log integration tests.
 *
 * Verifies that METADATA_ACCESS, CONTENT_ACCESS, UNLOCK_SUCCESS, UNLOCK_FAILURE,
 * and EXPIRED events are written to investor_room_access_log with the correct
 * room_id, room_code, access_mode, and client_ip fields.
 *
 * EXPIRED uses REQUIRES_NEW propagation so the audit record commits even though
 * the outer read-only transaction is rolled back by the NotFoundException.
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("TASK-019 — Investor Room Access Log Integration Tests")
class InvestorRoomAccessLogIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("pgvector/pgvector:pg16");

    @Container
    @ServiceConnection
    @SuppressWarnings("resource")
    static final GenericContainer<?> REDIS =
            new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    @Autowired InvestorRoomService             roomService;
    @Autowired InvestorRoomRepository          roomRepo;
    @Autowired InvestorRoomAccessLogRepository auditRepo;
    @Autowired UserRepository                  userRepo;

    private static final String CLIENT_IP = "203.0.113.42";

    private InvestorRoom linkOnlyRoom;
    private InvestorRoom passwordRoom;
    private UUID         actorId;

    @BeforeAll
    void seedRooms() {
        actorId = UUID.randomUUID();
        userRepo.save(new User(actorId, null,
                "investor-test-" + actorId + "@test.local",
                "$2a$10$test.hash.placeholder.for.tests.only",
                UserRole.SUPER_ADMIN, UserStatus.ACTIVE, false, Instant.now()));

        linkOnlyRoom = InvestorRoom.create("LNKONLY1", "Series A Deck", "LINK_ONLY", actorId);
        roomRepo.save(linkOnlyRoom);

        InvestorRoom pwd = InvestorRoom.create("PWDROOM1", "Board Room", "PASSWORD", actorId);
        pwd.setAccessSecret(BCrypt.hashpw("secret123", BCrypt.gensalt(10)));
        passwordRoom = roomRepo.save(pwd);
    }

    @AfterEach
    void clearAuditLog() {
        auditRepo.deleteAll();
    }

    @Test
    @DisplayName("[audit] CONTENT_ACCESS recorded for LINK_ONLY room on public GET")
    void linkOnlyRoom_publicGet_recordsContentAccess() {
        roomService.getPublicRoom(linkOnlyRoom.getRoomCode(), CLIENT_IP);

        List<InvestorRoomAccessLog> logs =
                auditRepo.findByRoomIdOrderByOccurredAtDesc(linkOnlyRoom.getId());

        assertThat(logs).hasSize(1);
        InvestorRoomAccessLog log = logs.get(0);
        assertThat(log.getEvent()).isEqualTo(InvestorRoomAccessEvent.CONTENT_ACCESS);
        assertThat(log.getRoomId()).isEqualTo(linkOnlyRoom.getId());
        assertThat(log.getRoomCode()).isEqualTo(linkOnlyRoom.getRoomCode());
        assertThat(log.getAccessMode()).isEqualTo("LINK_ONLY");
        assertThat(log.getClientIp()).isEqualTo(CLIENT_IP);
        assertThat(log.getOccurredAt()).isNotNull();
    }

    @Test
    @DisplayName("[audit] METADATA_ACCESS recorded for PASSWORD room on public GET")
    void passwordRoom_publicGet_recordsMetadataAccess() {
        roomService.getPublicRoom(passwordRoom.getRoomCode(), CLIENT_IP);

        List<InvestorRoomAccessLog> logs =
                auditRepo.findByRoomIdOrderByOccurredAtDesc(passwordRoom.getId());

        assertThat(logs).hasSize(1);
        assertThat(logs.get(0).getEvent()).isEqualTo(InvestorRoomAccessEvent.METADATA_ACCESS);
        assertThat(logs.get(0).getAccessMode()).isEqualTo("PASSWORD");
        assertThat(logs.get(0).getClientIp()).isEqualTo(CLIENT_IP);
    }

    @Test
    @DisplayName("[audit] UNLOCK_SUCCESS recorded when correct password submitted")
    void passwordRoom_correctPassword_recordsUnlockSuccess() {
        Optional<Object> result = roomService.unlockRoom(
                passwordRoom.getRoomCode(), "secret123", CLIENT_IP).map(r -> r);

        assertThat(result).isPresent();

        List<InvestorRoomAccessLog> logs =
                auditRepo.findByRoomIdOrderByOccurredAtDesc(passwordRoom.getId());

        assertThat(logs).hasSize(1);
        assertThat(logs.get(0).getEvent()).isEqualTo(InvestorRoomAccessEvent.UNLOCK_SUCCESS);
        assertThat(logs.get(0).getClientIp()).isEqualTo(CLIENT_IP);
    }

    @Test
    @DisplayName("[audit] UNLOCK_FAILURE recorded when wrong password submitted")
    void passwordRoom_wrongPassword_recordsUnlockFailure() {
        Optional<?> result = roomService.unlockRoom(
                passwordRoom.getRoomCode(), "wrongpass", CLIENT_IP);

        assertThat(result).isEmpty();

        List<InvestorRoomAccessLog> logs =
                auditRepo.findByRoomIdOrderByOccurredAtDesc(passwordRoom.getId());

        assertThat(logs).hasSize(1);
        assertThat(logs.get(0).getEvent()).isEqualTo(InvestorRoomAccessEvent.UNLOCK_FAILURE);
        assertThat(logs.get(0).getClientIp()).isEqualTo(CLIENT_IP);
    }

    @Test
    @DisplayName("[audit] EXPIRED event committed even though NotFoundException rolls back outer transaction")
    void expiredRoom_recordsExpiredEvent_survivesRollback() {
        InvestorRoom expired = InvestorRoom.create(
                "EXPROOM1", "Expired Room", "LINK_ONLY", actorId);
        expired.setExpiresAt(Instant.now().minus(1, ChronoUnit.HOURS));
        roomRepo.save(expired);

        assertThatThrownBy(() -> roomService.getPublicRoom(expired.getRoomCode(), CLIENT_IP))
                .isInstanceOf(NotFoundException.class);

        // REQUIRES_NEW propagation means the EXPIRED record is committed independently
        List<InvestorRoomAccessLog> logs =
                auditRepo.findByRoomIdOrderByOccurredAtDesc(expired.getId());

        assertThat(logs).as("EXPIRED audit record must be committed despite NotFoundException rollback")
                .hasSize(1);
        assertThat(logs.get(0).getEvent()).isEqualTo(InvestorRoomAccessEvent.EXPIRED);
        assertThat(logs.get(0).getClientIp()).isEqualTo(CLIENT_IP);
    }
}
