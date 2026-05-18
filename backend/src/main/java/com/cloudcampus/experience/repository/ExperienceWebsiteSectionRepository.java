package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.WebsiteSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExperienceWebsiteSectionRepository extends JpaRepository<WebsiteSection, UUID> {
    List<WebsiteSection> findByPageIdOrderByPositionAsc(UUID pageId);

    List<WebsiteSection> findByPageIdAndPublishedTrueOrderByPositionAsc(UUID pageId);
}
