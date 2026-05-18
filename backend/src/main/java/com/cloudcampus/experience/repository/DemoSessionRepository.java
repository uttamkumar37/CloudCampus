package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.DemoSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DemoSessionRepository extends JpaRepository<DemoSession, UUID> {

    Optional<DemoSession> findByVisitorTokenAndStatus(String visitorToken, String status);

    List<DemoSession> findByStatusAndExpiresAtBefore(String status, Instant cutoff);

    @Modifying
    @Query("UPDATE DemoSession s SET s.status = 'EXPIRED' WHERE s.status = 'ACTIVE' AND s.expiresAt < :now")
    int expireOldSessions(@Param("now") Instant now);
}
