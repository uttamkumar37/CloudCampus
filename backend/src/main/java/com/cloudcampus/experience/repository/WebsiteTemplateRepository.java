package com.cloudcampus.experience.repository;

import com.cloudcampus.experience.entity.WebsiteTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WebsiteTemplateRepository extends JpaRepository<WebsiteTemplate, UUID> {
    List<WebsiteTemplate> findAllByOrderByUpdatedAtDesc();

    List<WebsiteTemplate> findByPublishedTrueOrderByUpdatedAtDesc();
}
