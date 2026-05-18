package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.StakeholderJourney;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StakeholderJourneyRepository extends JpaRepository<StakeholderJourney, UUID> {
    List<StakeholderJourney> findAllByOrderByUpdatedAtDesc();

    Optional<StakeholderJourney> findFirstByStakeholderTypeAndPublishedTrueOrderByUpdatedAtDesc(String stakeholderType);
}
