package com.cloudcampus.website.repository;

import com.cloudcampus.website.entity.WebsiteNavItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WebsiteNavItemRepository extends JpaRepository<WebsiteNavItem, UUID> {

    List<WebsiteNavItem> findBySchoolIdOrderByPositionAsc(UUID schoolId);

    Optional<WebsiteNavItem> findByIdAndSchoolId(UUID id, UUID schoolId);

    void deleteBySchoolId(UUID schoolId);
}
