package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.WebsiteTheme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExperienceWebsiteThemeRepository extends JpaRepository<WebsiteTheme, UUID> {
    List<WebsiteTheme> findAllByOrderByUpdatedAtDesc();

    Optional<WebsiteTheme> findFirstByPublishedTrueOrderByUpdatedAtDesc();
}
