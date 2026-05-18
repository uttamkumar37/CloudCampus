package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.WebsitePublishSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExperienceWebsitePublishSnapshotRepository extends JpaRepository<WebsitePublishSnapshot, UUID> {
    List<WebsitePublishSnapshot> findAllByOrderByCreatedAtDesc();
}
