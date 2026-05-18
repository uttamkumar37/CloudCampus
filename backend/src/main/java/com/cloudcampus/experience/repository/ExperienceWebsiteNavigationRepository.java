package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.WebsiteNavigation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExperienceWebsiteNavigationRepository extends JpaRepository<WebsiteNavigation, UUID> {
    List<WebsiteNavigation> findAllByOrderByGroupNameAscPositionAsc();

    List<WebsiteNavigation> findByPublishedTrueAndVisibleTrueOrderByGroupNameAscPositionAsc();
}
