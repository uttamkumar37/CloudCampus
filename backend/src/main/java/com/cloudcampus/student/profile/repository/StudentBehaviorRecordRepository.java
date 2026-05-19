package com.cloudcampus.student.profile.repository;

import com.cloudcampus.student.profile.entity.StudentBehaviorRecord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentBehaviorRecordRepository extends JpaRepository<StudentBehaviorRecord, UUID> {
    List<StudentBehaviorRecord> findByStudentIdOrderByRecordedAtDesc(UUID studentId, Pageable pageable);
    long countByStudentId(UUID studentId);
}
