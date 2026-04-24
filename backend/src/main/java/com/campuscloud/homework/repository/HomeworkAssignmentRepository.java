package com.campuscloud.homework.repository;

import com.campuscloud.homework.entity.HomeworkAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HomeworkAssignmentRepository extends JpaRepository<HomeworkAssignment, UUID> {

    List<HomeworkAssignment> findByClassIdOrderByCreatedAtDesc(UUID classId);
}
