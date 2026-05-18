package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.WebsiteAuditTimelineEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExperienceWebsiteAuditTimelineRepository extends JpaRepository<WebsiteAuditTimelineEvent, UUID> {
    List<WebsiteAuditTimelineEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
