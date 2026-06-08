package com.cloudcampus.platform.superadmin.control;

import com.cloudcampus.operations.bulk.BulkJobStatus;
import com.cloudcampus.operations.report.ReportExportJob;
import com.cloudcampus.operations.report.ReportExportJobRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class SuperAdminReportExportWorker {

    private static final Logger LOGGER = LoggerFactory.getLogger(SuperAdminReportExportWorker.class);

    private final ReportExportJobRepository reportExportJobRepository;
    private final SuperAdminReportExportProcessor processor;

    public SuperAdminReportExportWorker(
            ReportExportJobRepository reportExportJobRepository,
            SuperAdminReportExportProcessor processor
    ) {
        this.reportExportJobRepository = reportExportJobRepository;
        this.processor = processor;
    }

    @Scheduled(
            fixedDelayString = "${cloudcampus.platform.report-export.worker-delay-ms:30000}",
            initialDelayString = "${cloudcampus.platform.report-export.worker-initial-delay-ms:10000}"
    )
    public void processQueuedPlatformExports() {
        for (ReportExportJob exportJob : reportExportJobRepository.findTop10BySchoolIsNullAndBulkJob_StatusOrderByRequestedAtAsc(BulkJobStatus.QUEUED)) {
            try {
                processor.processPlatformExport(exportJob.getId());
            } catch (RuntimeException exception) {
                LOGGER.warn("Platform report export {} failed during async processing: {}", exportJob.getId(), safeError(exception));
            }
        }
    }

    private String safeError(RuntimeException exception) {
        String message = exception.getMessage();
        if (message == null || message.isBlank()) {
            return exception.getClass().getSimpleName();
        }
        return message.lines()
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .findFirst()
                .orElse(exception.getClass().getSimpleName());
    }
}
