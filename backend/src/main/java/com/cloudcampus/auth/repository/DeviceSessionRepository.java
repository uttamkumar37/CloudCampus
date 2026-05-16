package com.cloudcampus.auth.repository;

import com.cloudcampus.auth.entity.DeviceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceSessionRepository extends JpaRepository<DeviceSession, UUID> {

    List<DeviceSession> findByUserIdAndRevokedFalseOrderByLastSeenAtDesc(UUID userId);

    Optional<DeviceSession> findByIdAndUserId(UUID id, UUID userId);
}
