package com.cloudcampus.website.repository;

import com.cloudcampus.website.entity.WebsiteSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WebsiteSectionRepository extends JpaRepository<WebsiteSection, UUID> {

    List<WebsiteSection> findByPageIdOrderByPositionAsc(UUID pageId);

    List<WebsiteSection> findByPageIdAndVisibleTrueOrderByPositionAsc(UUID pageId);

    Optional<WebsiteSection> findByIdAndPageId(UUID id, UUID pageId);

    void deleteByPageId(UUID pageId);
}
