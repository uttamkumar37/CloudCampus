package com.cloudcampus.experience.audit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InvestorRoomAccessLogRepository extends JpaRepository<InvestorRoomAccessLog, UUID> {

    List<InvestorRoomAccessLog> findByRoomIdOrderByOccurredAtDesc(UUID roomId);
}
