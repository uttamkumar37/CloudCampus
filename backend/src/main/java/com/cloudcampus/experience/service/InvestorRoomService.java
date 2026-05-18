package com.cloudcampus.experience.service;

import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.experience.dto.request.InvestorRoomCreateRequest;
import com.cloudcampus.experience.dto.response.InvestorRoomResponse;
import com.cloudcampus.experience.dto.response.InvestorRoomSectionResponse;
import com.cloudcampus.experience.entity.InvestorRoom;
import com.cloudcampus.experience.repository.InvestorRoomRepository;
import com.cloudcampus.experience.repository.InvestorRoomSectionRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class InvestorRoomService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final InvestorRoomRepository        repo;
    private final InvestorRoomSectionRepository sectionRepo;

    public InvestorRoomService(InvestorRoomRepository repo,
                               InvestorRoomSectionRepository sectionRepo) {
        this.repo        = repo;
        this.sectionRepo = sectionRepo;
    }

    public InvestorRoomResponse getRoom(String roomCode) {
        InvestorRoom room = repo.findByRoomCodeAndStatus(roomCode, "ACTIVE")
                .orElseThrow(() -> new NotFoundException("Investor room not found: " + roomCode));

        List<InvestorRoomSectionResponse> sections = sectionRepo
                .findByRoomIdAndVisibilityOrderByPosition(room.getId(), "VISIBLE")
                .stream()
                .map(InvestorRoomSectionResponse::from)
                .toList();

        return InvestorRoomResponse.from(room, sections);
    }

    public List<InvestorRoomResponse> listActive() {
        return repo.findByStatusOrderByCreatedAtDesc("ACTIVE")
                .stream().map(InvestorRoomResponse::from).toList();
    }

    @Transactional
    public InvestorRoomResponse create(InvestorRoomCreateRequest req, UUID actorId) {
        String roomCode = generateRoomCode();
        InvestorRoom room = InvestorRoom.create(roomCode, req.title(), req.accessMode(), actorId);

        if ("PASSWORD".equals(req.accessMode()) && req.accessPassword() != null) {
            room.setAccessSecret(BCrypt.hashpw(req.accessPassword(), BCrypt.gensalt(10)));
        }
        if (req.expiresInDays() > 0) {
            room.setExpiresAt(Instant.now().plus(req.expiresInDays(), ChronoUnit.DAYS));
        }
        return InvestorRoomResponse.from(repo.save(room));
    }

    @Transactional
    @CacheEvict(value = "exp:room", key = "#roomCode")
    public String regenerateCode(UUID roomId) {
        InvestorRoom room = repo.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Room not found"));
        room.archive();
        repo.save(room);
        return room.getRoomCode();
    }

    public boolean verifyPassword(String roomCode, String candidatePassword) {
        return repo.findByRoomCodeAndStatus(roomCode, "ACTIVE")
                .map(r -> r.getAccessSecret() != null &&
                          BCrypt.checkpw(candidatePassword, r.getAccessSecret()))
                .orElse(false);
    }

    private static String generateRoomCode() {
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        return sb.toString();
    }
}
