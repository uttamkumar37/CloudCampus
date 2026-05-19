package com.cloudcampus.student.profile.repository;

import com.cloudcampus.student.profile.entity.StudentLogisticsProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentLogisticsProfileRepository extends JpaRepository<StudentLogisticsProfile, UUID> {
    Optional<StudentLogisticsProfile> findByStudentId(UUID studentId);
}
