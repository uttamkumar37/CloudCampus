package com.cloudcampus.website.repository;

import com.cloudcampus.website.entity.Website;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WebsiteRepository extends JpaRepository<Website, UUID> {
    Optional<Website> findBySchoolId(UUID schoolId);
    boolean existsBySchoolId(UUID schoolId);
}
