package com.cloudcampus.experience;

import com.cloudcampus.auth.entity.User;
import com.cloudcampus.auth.entity.UserRole;
import com.cloudcampus.auth.entity.UserStatus;
import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.audit.InvestorRoomAccessLogRepository;
import com.cloudcampus.experience.dto.response.InvestorRoomResponse;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * TASK-020 — Investor room expiry validation tests.
 *
 * Proves that expired rooms never expose protected content regardless of
 * access mode.  LINK_ONLY rooms are particularly important: the link-only
 * grant rule must not bypass expiry.
 *
 * Test matrix:
 *   expired LINK_ONLY  × getPublicRoom → NotFoundException
 *   expired LINK_ONLY  × unlockRoom    → NotFoundException  (link-only rule does not override expiry)
 *   expired PASSWORD   × getPublicRoom → NotFoundException
 *   expired PASSWORD   × unlockRoom(correct password) → NotFoundException  (correct pw does not override expiry)
 *   active (no expiry) × getPublicRoom → content returned
 *   active (future)    × getPublicRoom → content returned
 *   listPublicActive   → expired rooms excluded, active rooms included
 */
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("TASK-020 — Investor Room Expiry Validation Tests")
class InvestorRoomExpiryValidationTest {

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

    private static final String CLIENT_IP   = "198.51.100.7";
    private static final String ROOM_SECRET = "correct-secret-42";

    private InvestorRoom expiredLinkOnly;
    private InvestorRoom expiredPassword;
    private InvestorRoom activeNoExpiry;
    private InvestorRoom activeFutureExpiry;

    @BeforeAll
    void seedRooms() {
        UUID actorId = UUID.randomUUID();
        userRepo.save(new User(actorId, null,
                "expiry-test-" + actorId + "@test.local",
                "$2a$10$test.hash.placeholder.for.tests.only",
                UserRole.SUPER_ADMIN, UserStatus.ACTIVE, false, Instant.now()));

        InvestorRoom el = InvestorRoom.create("EXL00001", "Expired Link-Only Room", "LINK_ONLY", actorId);
        el.setExpiresAt(Instant.now().minus(1, ChronoUnit.HOURS));
        expiredLinkOnly = roomRepo.save(el);

        InvestorRoom ep = InvestorRoom.create("EXP00001", "Expired Password Room", "PASSWORD", actorId);
        ep.setExpiresAt(Instant.now().minus(2, ChronoUnit.HOURS));
        ep.setAccessSecret(BCrypt.hashpw(ROOM_SECRET, BCrypt.gensalt(10)));
        expiredPassword = roomRepo.save(ep);

        InvestorRoom an = InvestorRoom.create("ACT00001", "Active Room No Expiry", "LINK_ONLY", actorId);
        activeNoExpiry = roomRepo.save(an);

        InvestorRoom af = InvestorRoom.create("ACTF0001", "Active Room Future Expiry", "LINK_ONLY", actorId);
        af.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS));
        activeFutureExpiry = roomRepo.save(af);
    }

    @AfterEach
    void clearAuditLog() {
        auditRepo.deleteAll();
    }

    // ── Expired LINK_ONLY room ────────────────────────────────────────────────

    @Test
    @DisplayName("[expiry] expired LINK_ONLY room — getPublicRoom throws NotFoundException")
    void expiredLinkOnlyRoom_getPublicRoom_throwsNotFound() {
        assertThatThrownBy(() ->
                roomService.getPublicRoom(expiredLinkOnly.getRoomCode(), CLIENT_IP))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining(expiredLinkOnly.getRoomCode());
    }

    @Test
    @DisplayName("[expiry] expired LINK_ONLY room — unlockRoom throws NotFoundException, link-only grant does not bypass expiry")
    void expiredLinkOnlyRoom_unlockRoom_throwsNotFound() {
        assertThatThrownBy(() ->
                roomService.unlockRoom(expiredLinkOnly.getRoomCode(), null, CLIENT_IP))
                .isInstanceOf(NotFoundException.class);
    }

    // ── Expired PASSWORD room ─────────────────────────────────────────────────

    @Test
    @DisplayName("[expiry] expired PASSWORD room — getPublicRoom throws NotFoundException")
    void expiredPasswordRoom_getPublicRoom_throwsNotFound() {
        assertThatThrownBy(() ->
                roomService.getPublicRoom(expiredPassword.getRoomCode(), CLIENT_IP))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("[expiry] expired PASSWORD room — correct password does not override expiry, unlockRoom throws NotFoundException")
    void expiredPasswordRoom_correctPassword_unlockRoom_throwsNotFound() {
        assertThatThrownBy(() ->
                roomService.unlockRoom(expiredPassword.getRoomCode(), ROOM_SECRET, CLIENT_IP))
                .isInstanceOf(NotFoundException.class);
    }

    // ── Active rooms remain accessible ────────────────────────────────────────

    @Test
    @DisplayName("[expiry] active room with null expiresAt — getPublicRoom returns content")
    void activeRoomNoExpiry_getPublicRoom_returnsContent() {
        InvestorRoomResponse response =
                roomService.getPublicRoom(activeNoExpiry.getRoomCode(), CLIENT_IP);

        assertThat(response).isNotNull();
        assertThat(response.roomCode()).isEqualTo(activeNoExpiry.getRoomCode());
        assertThat(response.title()).isEqualTo(activeNoExpiry.getTitle());
    }

    @Test
    @DisplayName("[expiry] active room with future expiresAt — getPublicRoom returns content")
    void activeRoomFutureExpiry_getPublicRoom_returnsContent() {
        InvestorRoomResponse response =
                roomService.getPublicRoom(activeFutureExpiry.getRoomCode(), CLIENT_IP);

        assertThat(response).isNotNull();
        assertThat(response.roomCode()).isEqualTo(activeFutureExpiry.getRoomCode());
        assertThat(response.expiresAt()).isAfter(Instant.now());
    }

    // ── Public listing excludes expired rooms ─────────────────────────────────

    @Test
    @DisplayName("[expiry] listPublicActive excludes expired rooms and includes non-expired active rooms")
    void listPublicActive_excludesExpiredIncludesActive() {
        List<InvestorRoomResponse> result = roomService.listPublicActive();

        assertThat(result)
                .as("Expired LINK_ONLY room must not appear in public listing")
                .noneMatch(r -> r.roomCode().equals(expiredLinkOnly.getRoomCode()));

        assertThat(result)
                .as("Expired PASSWORD room must not appear in public listing")
                .noneMatch(r -> r.roomCode().equals(expiredPassword.getRoomCode()));

        assertThat(result)
                .as("Active room with no expiry must appear in public listing")
                .anyMatch(r -> r.roomCode().equals(activeNoExpiry.getRoomCode()));

        assertThat(result)
                .as("Active room with future expiry must appear in public listing")
                .anyMatch(r -> r.roomCode().equals(activeFutureExpiry.getRoomCode()));
    }
}
