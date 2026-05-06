package com.cloudcampus.homework.repository;

import com.cloudcampus.homework.entity.HomeworkAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HomeworkAssignmentRepository extends JpaRepository<HomeworkAssignment, UUID> {

    List<HomeworkAssignment> findByClassIdOrderByCreatedAtDesc(UUID classId);

    // Student dashboard — limited subset by class+section
    List<HomeworkAssignment> findTop5ByClassIdOrderByCreatedAtDesc(UUID classId);

    // Teacher dashboard
    List<HomeworkAssignment> findTop5ByAssignedByUserIdOrderByCreatedAtDesc(UUID assignedByUserId);

    List<HomeworkAssignment> findTop10ByClassIdAndSectionIdOrderByCreatedAtDesc(UUID classId, UUID sectionId);
}
