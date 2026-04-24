package com.campuscloud.bulk.service;

import com.campuscloud.bulk.dto.BulkUploadResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface BulkUploadService {

    BulkUploadResponse uploadWorkbook(MultipartFile file);

    Resource generateSampleWorkbook();
}
