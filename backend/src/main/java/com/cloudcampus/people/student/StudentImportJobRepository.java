package com.cloudcampus.people.student;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentImportJobRepository extends JpaRepository<StudentImportJob, String> {

    Optional<StudentImportJob> findByBulkJobId(String bulkJobId);

    List<StudentImportJob> findBySchoolIdOrderByCreatedAtDesc(String schoolId);
}
