package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.InvestorRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvestorRoomRepository extends JpaRepository<InvestorRoom, UUID> {

    Optional<InvestorRoom> findByRoomCodeAndStatus(String roomCode, String status);

    List<InvestorRoom> findByStatusOrderByCreatedAtDesc(String status);
}
