package com.cloudcampus.student.profile.repository;

import com.cloudcampus.student.profile.entity.StudentCommunicationEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentCommunicationEventRepository extends JpaRepository<StudentCommunicationEvent, UUID> {
    List<StudentCommunicationEvent> findByStudentIdOrderByOccurredAtDesc(UUID studentId, Pageable pageable);
    long countByStudentId(UUID studentId);
}
