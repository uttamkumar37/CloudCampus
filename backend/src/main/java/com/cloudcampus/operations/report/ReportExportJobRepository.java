package com.cloudcampus.operations.report;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportExportJobRepository extends JpaRepository<ReportExportJob, String> {

    List<ReportExportJob> findBySchoolIdOrderByRequestedAtDesc(String schoolId);

    Optional<ReportExportJob> findByBulkJobId(String bulkJobId);
}
