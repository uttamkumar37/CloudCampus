package com.cloudcampus.operations.finance;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeDemandRepository extends JpaRepository<FeeDemand, String> {

    List<FeeDemand> findBySchoolIdOrderByDueDateAscCreatedAtAsc(String schoolId);

    List<FeeDemand> findByStudentIdOrderByDueDateAscCreatedAtAsc(String studentId);
}
