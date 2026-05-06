package com.cloudcampus.bulk.service;

import com.cloudcampus.bulk.dto.BulkUploadResponse;
import com.cloudcampus.bulk.dto.BulkValidationRowResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BulkUploadService {

    BulkUploadResponse uploadWorkbook(MultipartFile file);

    Resource generateSampleWorkbook();

    /**
     * Parses a students-only Excel (.xlsx) and returns validation rows without persisting anything.
     * Accepts a workbook with a sheet named "STUDENTS" or falls back to the first sheet.
     * Expected columns: admission_no, first_name, last_name, dob, gender, email, phone
     */
    List<BulkValidationRowResponse> previewStudentsSheet(MultipartFile file);

    List<BulkValidationRowResponse> previewTeachersSheet(MultipartFile file);

    /**
     * Parses a students-only Excel (.xlsx) and persists valid student records.
     * Accepts a workbook with a sheet named "STUDENTS" or falls back to the first sheet.
     */
    BulkUploadResponse processStudentsSheet(MultipartFile file, boolean sendCredentials, boolean forcePasswordReset);

    BulkUploadResponse processTeachersSheet(MultipartFile file, boolean sendCredentials, boolean forcePasswordReset);

    /**
     * Generates an operation-specific sample XLSX template.
     * Pass one of: students, teachers, academic, timetable, attendance, parents, master.
     * Falls back to the full 4-sheet master workbook when operation is unknown/null.
     */
    Resource generateSampleForOperation(String operation);
}
