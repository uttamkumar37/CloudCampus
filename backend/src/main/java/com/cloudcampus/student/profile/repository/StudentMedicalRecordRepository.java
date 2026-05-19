package com.cloudcampus.student.profile.repository;

import com.cloudcampus.student.profile.entity.StudentMedicalRecord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentMedicalRecordRepository extends JpaRepository<StudentMedicalRecord, UUID> {
    List<StudentMedicalRecord> findByStudentIdOrderByRecordedAtDesc(UUID studentId, Pageable pageable);
    long countByStudentId(UUID studentId);
}
