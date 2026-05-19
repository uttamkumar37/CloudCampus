package com.cloudcampus.student.profile.repository;

import com.cloudcampus.student.profile.entity.StudentAchievementRecord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentAchievementRecordRepository extends JpaRepository<StudentAchievementRecord, UUID> {
    List<StudentAchievementRecord> findByStudentIdOrderByCreatedAtDesc(UUID studentId, Pageable pageable);
    long countByStudentId(UUID studentId);
}
