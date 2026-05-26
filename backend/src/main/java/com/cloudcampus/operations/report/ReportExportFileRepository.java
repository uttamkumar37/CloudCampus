package com.cloudcampus.operations.report;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportExportFileRepository extends JpaRepository<ReportExportFile, String> {

    Optional<ReportExportFile> findByReportExportJobId(String reportExportJobId);
}
