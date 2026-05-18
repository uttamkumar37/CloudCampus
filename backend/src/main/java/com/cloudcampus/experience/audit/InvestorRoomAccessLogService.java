package com.cloudcampus.experience.audit;

import com.cloudcampus.experience.entity.InvestorRoom;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Writes immutable audit records for investor room access events (TASK-019).
 *
 * Uses REQUIRES_NEW propagation so that EXPIRED events committed immediately
 * before a NotFoundException is thrown are not rolled back with the outer
 * read-only transaction.
 */
@Service
public class InvestorRoomAccessLogService {

    private final InvestorRoomAccessLogRepository repo;

    public InvestorRoomAccessLogService(InvestorRoomAccessLogRepository repo) {
        this.repo = repo;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(InvestorRoomAccessEvent event, InvestorRoom room, String clientIp) {
        repo.save(InvestorRoomAccessLog.create(
                event,
                room.getId(),
                room.getRoomCode(),
                room.getAccessMode(),
                clientIp));
    }
}
