package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.WebsitePage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExperienceWebsitePageRepository extends JpaRepository<WebsitePage, UUID> {
    List<WebsitePage> findByDeletedFalseOrderByUpdatedAtDesc();

    List<WebsitePage> findByDeletedFalseAndPublishedTrueOrderByUpdatedAtDesc();

    Optional<WebsitePage> findBySlugAndDeletedFalse(String slug);

    Optional<WebsitePage> findBySlugAndDeletedFalseAndPublishedTrue(String slug);
}
