package com.cloudcampus.video.repository;

import com.cloudcampus.video.entity.VideoResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VideoResourceRepository extends JpaRepository<VideoResource, UUID> {
    Optional<VideoResource> findByIdAndTenantId(UUID id, UUID tenantId);

    List<VideoResource> findBySchoolIdOrderByCreatedAtDesc(UUID schoolId);
    List<VideoResource> findByStaffIdOrderByCreatedAtDesc(UUID staffId);
    List<VideoResource> findBySubjectIdAndTenantIdOrderByCreatedAtDesc(UUID subjectId, UUID tenantId);
    List<VideoResource> findByClassIdAndTenantIdOrderByCreatedAtDesc(UUID classId, UUID tenantId);
}
