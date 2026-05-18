package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.Presentation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PresentationRepository extends JpaRepository<Presentation, UUID> {

    Optional<Presentation> findBySlugAndStatus(String slug, String status);

    List<Presentation> findByStatusOrderByCreatedAtDesc(String status);

    List<Presentation> findByAudienceTypeAndStatusOrderByCreatedAtDesc(String audienceType, String status);
}
