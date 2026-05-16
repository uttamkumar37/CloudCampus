package com.cloudcampus.website.repository;

import com.cloudcampus.website.entity.WebsitePage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WebsitePageRepository extends JpaRepository<WebsitePage, UUID> {

    List<WebsitePage> findBySchoolIdOrderByDisplayOrderAsc(UUID schoolId);

    List<WebsitePage> findBySchoolIdAndPublishedTrueOrderByDisplayOrderAsc(UUID schoolId);

    Optional<WebsitePage> findBySchoolIdAndSlug(UUID schoolId, String slug);

    Optional<WebsitePage> findByIdAndSchoolId(UUID id, UUID schoolId);

    boolean existsBySchoolIdAndSlug(UUID schoolId, String slug);
}
