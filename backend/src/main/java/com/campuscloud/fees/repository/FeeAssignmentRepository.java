package com.campuscloud.fees.repository;

import com.campuscloud.fees.entity.FeeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FeeAssignmentRepository extends JpaRepository<FeeAssignment, UUID> {

    List<FeeAssignment> findAllByStudentId(UUID studentId);
}
