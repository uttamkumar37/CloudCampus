package com.cloudcampus.student.profile.repository;

import com.cloudcampus.student.profile.entity.StudentEnrichmentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentEnrichmentProfileRepository extends JpaRepository<StudentEnrichmentProfile, UUID> {
    Optional<StudentEnrichmentProfile> findByStudentId(UUID studentId);
}
