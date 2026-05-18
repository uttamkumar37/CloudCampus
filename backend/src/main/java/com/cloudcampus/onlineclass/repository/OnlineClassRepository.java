package com.cloudcampus.onlineclass.repository;

import com.cloudcampus.onlineclass.entity.OnlineClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OnlineClassRepository extends JpaRepository<OnlineClass, UUID> {
    Optional<OnlineClass> findByIdAndTenantId(UUID id, UUID tenantId);

    List<OnlineClass> findBySchoolIdAndScheduledAtBetweenOrderByScheduledAtAsc(
            UUID schoolId, Instant from, Instant to);
    List<OnlineClass> findByStaffIdAndScheduledAtBetweenOrderByScheduledAtAsc(
            UUID staffId, Instant from, Instant to);
    List<OnlineClass> findBySectionIdAndScheduledAtBetweenOrderByScheduledAtAsc(
            UUID sectionId, Instant from, Instant to);
}
