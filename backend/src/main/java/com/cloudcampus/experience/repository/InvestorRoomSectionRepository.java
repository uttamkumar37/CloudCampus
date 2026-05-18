package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.InvestorRoomSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InvestorRoomSectionRepository extends JpaRepository<InvestorRoomSection, UUID> {

    List<InvestorRoomSection> findByRoomIdAndVisibilityOrderByPosition(UUID roomId, String visibility);
}
