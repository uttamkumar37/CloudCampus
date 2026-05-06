package com.cloudcampus.bulk.service;

import com.cloudcampus.bulk.dto.BulkExecuteRequest;
import com.cloudcampus.bulk.dto.BulkJobListResponse;
import com.cloudcampus.bulk.dto.BulkJobResponse;
import com.cloudcampus.bulk.dto.BulkOperationsMetadataResponse;
import com.cloudcampus.bulk.dto.BulkPreviewResponse;
import com.cloudcampus.bulk.dto.BulkUploadResponse;
import com.cloudcampus.bulk.dto.BulkValidationResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface BulkWorkflowService {

    BulkOperationsMetadataResponse getOperations();

    BulkValidationResponse validate(String operation, MultipartFile file);

    BulkPreviewResponse preview(String validationId);

    BulkUploadResponse execute(BulkExecuteRequest request);

    BulkJobListResponse listJobs();

    BulkJobResponse getJob(String jobId);

    BulkJobResponse retryJob(String jobId);

    Resource downloadErrorReport(String jobId);
}
