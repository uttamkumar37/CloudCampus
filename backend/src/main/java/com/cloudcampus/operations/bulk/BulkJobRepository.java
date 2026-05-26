package com.cloudcampus.operations.bulk;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BulkJobRepository extends JpaRepository<BulkJob, String> {

    List<BulkJob> findBySchoolIdOrderByRequestedAtDesc(String schoolId);

    List<BulkJob> findTop100ByStatusOrderByRequestedAtAsc(BulkJobStatus status);
}
