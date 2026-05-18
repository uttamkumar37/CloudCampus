package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.WebsiteSeoSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExperienceWebsiteSeoSettingsRepository extends JpaRepository<WebsiteSeoSettings, UUID> {
    Optional<WebsiteSeoSettings> findByRoutePath(String routePath);

    Optional<WebsiteSeoSettings> findByRoutePathAndPublishedTrue(String routePath);

    List<WebsiteSeoSettings> findAllByOrderByUpdatedAtDesc();
}
