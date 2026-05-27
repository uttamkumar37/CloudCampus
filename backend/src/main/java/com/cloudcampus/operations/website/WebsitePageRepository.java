package com.cloudcampus.operations.website;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WebsitePageRepository extends JpaRepository<WebsitePage, String> {

    List<WebsitePage> findBySchoolIdOrderByCreatedAtDesc(String schoolId);

    boolean existsBySchoolIdAndSlug(String schoolId, String slug);
}
