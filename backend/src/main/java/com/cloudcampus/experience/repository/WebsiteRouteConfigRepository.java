package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.WebsiteRouteConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WebsiteRouteConfigRepository extends JpaRepository<WebsiteRouteConfig, UUID> {
    List<WebsiteRouteConfig> findAllByOrderByUpdatedAtDesc();

    Optional<WebsiteRouteConfig> findFirstByRoutePathAndPublishedTrue(String routePath);
}
