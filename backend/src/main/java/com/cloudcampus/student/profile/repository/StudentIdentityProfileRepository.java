package com.cloudcampus.student.profile.repository;

import com.cloudcampus.student.profile.entity.StudentIdentityProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentIdentityProfileRepository extends JpaRepository<StudentIdentityProfile, UUID> {
    Optional<StudentIdentityProfile> findByStudentId(UUID studentId);
}
