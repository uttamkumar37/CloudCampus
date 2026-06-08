package com.cloudcampus.operations.report;

import java.util.List;
import java.util.Optional;

import com.cloudcampus.operations.bulk.BulkJobStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ReportExportJobRepository extends JpaRepository<ReportExportJob, String>, JpaSpecificationExecutor<ReportExportJob> {

    List<ReportExportJob> findBySchoolIdOrderByRequestedAtDesc(String schoolId);

    List<ReportExportJob> findAllByOrderByRequestedAtDesc();

    List<ReportExportJob> findTop10ByOrderByRequestedAtDesc();

    List<ReportExportJob> findTop10BySchoolIsNullAndBulkJob_StatusOrderByRequestedAtAsc(BulkJobStatus status);

    Optional<ReportExportJob> findByBulkJobId(String bulkJobId);
}
