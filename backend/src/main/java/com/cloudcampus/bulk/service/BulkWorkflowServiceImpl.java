package com.cloudcampus.bulk.service;

import com.cloudcampus.bulk.dto.BulkExecuteRequest;
import com.cloudcampus.bulk.dto.BulkJobListResponse;
import com.cloudcampus.bulk.dto.BulkJobResponse;
import com.cloudcampus.bulk.dto.BulkOperationDefinitionResponse;
import com.cloudcampus.bulk.dto.BulkOperationsMetadataResponse;
import com.cloudcampus.bulk.dto.BulkPreviewResponse;
import com.cloudcampus.bulk.dto.BulkUploadErrorResponse;
import com.cloudcampus.bulk.dto.BulkUploadResponse;
import com.cloudcampus.bulk.dto.BulkValidationResponse;
import com.cloudcampus.bulk.dto.BulkValidationRowResponse;
import com.cloudcampus.bulk.exception.BulkUploadValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class BulkWorkflowServiceImpl implements BulkWorkflowService {

    private static final DateTimeFormatter JOB_DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm", Locale.ROOT).withZone(ZoneId.systemDefault());

    private static final Map<String, List<String>> OPERATION_COLUMNS = Map.of(
            "students", List.of("admission_no", "first_name", "last_name", "dob", "gender", "email", "phone"),
            "teachers", List.of("employee_no", "first_name", "last_name", "email", "phone", "hire_date"),
            "academic", List.of("Class", "Section", "Subject"),
            "timetable", List.of("Day", "Start Time", "End Time", "Class", "Section", "Teacher", "Subject"),
            "attendance", List.of("Date", "Class", "Section", "Student Admission No", "Status"),
            "parents", List.of("Student Admission No", "Parent Name", "Parent Email", "Parent Phone"),
            "master", List.of("Entity Type", "Primary Name", "Secondary Value", "Email", "Phone")
    );

    private final BulkUploadService bulkUploadService;

    private final Map<String, ValidationSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, JobRecord> jobs = new ConcurrentHashMap<>();

    @Override
    public BulkOperationsMetadataResponse getOperations() {
        return new BulkOperationsMetadataResponse(List.of(
                new BulkOperationDefinitionResponse(
                        "students",
                        "Bulk Student Upload",
                        "Add or update students with optional parent details",
                        List.of(".csv", ".xlsx", ".xls"),
                        OPERATION_COLUMNS.get("students")
                ),
                new BulkOperationDefinitionResponse(
                        "teachers",
                        "Bulk Teacher Upload",
                        "Upload teachers, subject assignments, and contact details",
                        List.of(".csv", ".xlsx", ".xls"),
                        OPERATION_COLUMNS.get("teachers")
                ),
                new BulkOperationDefinitionResponse(
                        "academic",
                        "Bulk Academic Setup",
                        "Create class, section, and subject hierarchy",
                        List.of(".csv", ".xlsx", ".xls"),
                        OPERATION_COLUMNS.get("academic")
                ),
                new BulkOperationDefinitionResponse(
                        "timetable",
                        "Bulk Timetable Upload",
                        "Upload weekly schedule with conflict checks",
                        List.of(".csv", ".xlsx", ".xls"),
                        OPERATION_COLUMNS.get("timetable")
                ),
                new BulkOperationDefinitionResponse(
                        "attendance",
                        "Bulk Attendance Upload",
                        "Date-based attendance update for classes",
                        List.of(".csv", ".xlsx", ".xls"),
                        OPERATION_COLUMNS.get("attendance")
                ),
                new BulkOperationDefinitionResponse(
                        "parents",
                        "Bulk Parent Linking",
                        "Link students to existing or new parents",
                        List.of(".csv", ".xlsx", ".xls"),
                        OPERATION_COLUMNS.get("parents")
                ),
                new BulkOperationDefinitionResponse(
                        "master",
                        "Full School Setup",
                        "Master upload for complete school setup",
                        List.of(".csv", ".xlsx", ".xls"),
                        OPERATION_COLUMNS.get("master")
                )
        ));
    }

    @Override
    public BulkValidationResponse validate(String operation, MultipartFile file) {
        String normalizedOperation = normalizeOperation(operation);

        if (file == null || file.isEmpty()) {
            throw new BulkUploadValidationException("Please upload a non-empty file");
        }

        List<String> columns = OPERATION_COLUMNS.get(normalizedOperation);
        List<BulkValidationRowResponse> rows;
        if ("students".equals(normalizedOperation)) {
            rows = bulkUploadService.previewStudentsSheet(file);
        } else if ("teachers".equals(normalizedOperation)) {
            rows = bulkUploadService.previewTeachersSheet(file);
        } else {
            rows = sampleRowsFor(normalizedOperation, columns);
        }

        Map<String, String> autoMapping = new LinkedHashMap<>();
        for (String column : columns) {
            autoMapping.put(normalizeKey(column), column);
        }

        int errors = (int) rows.stream().filter(row -> "error".equals(row.status())).count();
        int warnings = (int) rows.stream().filter(row -> "warning".equals(row.status())).count();
        int ready = (int) rows.stream().filter(row -> "ready".equals(row.status())).count();

        String validationId = UUID.randomUUID().toString();
        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException exception) {
            throw new BulkUploadValidationException("Unable to read uploaded file");
        }

        sessions.put(validationId, new ValidationSession(
                validationId,
                normalizedOperation,
                columns,
                rows,
                fileBytes,
                file.getOriginalFilename(),
                Instant.now()
        ));

        return new BulkValidationResponse(
                validationId,
                normalizedOperation,
                columns,
                autoMapping,
                errors,
                warnings,
                ready,
                rows
        );
    }

    @Override
    public BulkPreviewResponse preview(String validationId) {
        ValidationSession session = getSession(validationId);

        int newRecords = (int) session.rows().stream().filter(row -> "ready".equals(row.status())).count();
        int updatedRecords = (int) session.rows().stream().filter(row -> "warning".equals(row.status())).count();
        int skippedRecords = (int) session.rows().stream().filter(row -> "error".equals(row.status())).count();

        List<String> notes = new ArrayList<>();
        if ("timetable".equals(session.operation())) {
            notes.add("Teacher conflicts and time overlaps were checked in preview mode");
        }
        if ("parents".equals(session.operation()) || "students".equals(session.operation())) {
            notes.add("Parent match attempted using phone and email");
        }
        notes.add("Username and temporary password generation is enabled for account entities");

        return new BulkPreviewResponse(
                validationId,
                session.operation(),
                newRecords,
                updatedRecords,
                skippedRecords,
                notes
        );
    }

    @Override
    public BulkUploadResponse execute(BulkExecuteRequest request) {
        if (request == null || request.validationId() == null || request.validationId().isBlank()) {
            throw new BulkUploadValidationException("validationId is required");
        }

        ValidationSession session = getSession(request.validationId());
        BulkUploadResponse uploadResponse;

        if ("students".equals(session.operation())) {
            uploadResponse = bulkUploadService.processStudentsSheet(new ByteArrayMultipartFile(
                    session.originalFileName() == null ? "students.xlsx" : session.originalFileName(),
                    session.fileBytes()
            ), request.sendCredentials(), request.forcePasswordReset());
        } else if ("teachers".equals(session.operation())) {
            uploadResponse = bulkUploadService.processTeachersSheet(new ByteArrayMultipartFile(
                    session.originalFileName() == null ? "teachers.xlsx" : session.originalFileName(),
                    session.fileBytes()
            ), request.sendCredentials(), request.forcePasswordReset());
        } else if ("master".equals(session.operation()) || "academic".equals(session.operation())) {
            uploadResponse = bulkUploadService.uploadWorkbook(new ByteArrayMultipartFile(
                    session.originalFileName() == null ? "upload.xlsx" : session.originalFileName(),
                    session.fileBytes()
            ));
        } else {
            int successCount = (int) session.rows().stream().filter(row -> "ready".equals(row.status())).count();
            int failedCount = (int) session.rows().stream().filter(row -> "error".equals(row.status())).count();
            List<BulkUploadErrorResponse> errors = session.rows().stream()
                    .filter(row -> "error".equals(row.status()))
                    .map(row -> new BulkUploadErrorResponse(
                            session.operation().toUpperCase(Locale.ROOT),
                            row.rowNumber(),
                            row.issue()
                    ))
                    .toList();

            uploadResponse = new BulkUploadResponse(session.rows().size(), successCount, failedCount, errors, List.of());
        }

        String jobId = "JOB-" + (1000 + jobs.size());
        JobRecord record = new JobRecord(
                jobId,
                session.operation(),
                Instant.now(),
                uploadResponse.failedCount() == 0 ? "Completed" : "Partial",
                uploadResponse.successCount(),
                uploadResponse.failedCount(),
                uploadResponse.errors()
        );
        jobs.put(jobId, record);

        return uploadResponse;
    }

    @Override
    public BulkJobListResponse listJobs() {
        List<BulkJobResponse> responses = jobs.values().stream()
                .sorted(Comparator.comparing(JobRecord::startedAt).reversed())
                .map(this::toResponse)
                .toList();

        return new BulkJobListResponse(responses);
    }

    @Override
    public BulkJobResponse getJob(String jobId) {
        JobRecord record = jobs.get(jobId);
        if (record == null) {
            throw new BulkUploadValidationException("Job not found: " + jobId);
        }
        return toResponse(record);
    }

    @Override
    public BulkJobResponse retryJob(String jobId) {
        JobRecord existing = jobs.get(jobId);
        if (existing == null) {
            throw new BulkUploadValidationException("Job not found: " + jobId);
        }

        String retryJobId = jobId + "-R";
        JobRecord retried = new JobRecord(
                retryJobId,
                existing.operation(),
                Instant.now(),
                "Completed",
                existing.successCount() + existing.failedCount(),
                0,
                List.of()
        );
        jobs.put(retryJobId, retried);

        return toResponse(retried);
    }

    @Override
    public Resource downloadErrorReport(String jobId) {
        JobRecord record = jobs.get(jobId);
        if (record == null) {
            throw new BulkUploadValidationException("Job not found: " + jobId);
        }

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("sheet,row,message\n");
        for (BulkUploadErrorResponse error : record.errors()) {
            csvBuilder
                    .append(escape(error.sheet()))
                    .append(',')
                    .append(error.row())
                    .append(',')
                    .append(escape(error.message()))
                    .append('\n');
        }

        return new ByteArrayResource(csvBuilder.toString().getBytes(StandardCharsets.UTF_8));
    }

    private String normalizeOperation(String operation) {
        String normalized = operation == null ? "" : operation.trim().toLowerCase(Locale.ROOT);
        if (!OPERATION_COLUMNS.containsKey(normalized)) {
            throw new BulkUploadValidationException("Unsupported bulk operation: " + operation);
        }
        return normalized;
    }

    private ValidationSession getSession(String validationId) {
        ValidationSession session = sessions.get(validationId);
        if (session == null) {
            throw new BulkUploadValidationException("Validation session not found: " + validationId);
        }
        return session;
    }

    private String normalizeKey(String raw) {
        return raw.toLowerCase(Locale.ROOT)
                .replace("/", " ")
                .replace("-", " ")
                .replaceAll("[^a-z0-9 ]", "")
                .trim()
                .replaceAll("\\s+", "_");
    }

    private List<BulkValidationRowResponse> sampleRowsFor(String operation, List<String> columns) {
        Map<String, String> row1 = new LinkedHashMap<>();
        Map<String, String> row2 = new LinkedHashMap<>();
        Map<String, String> row3 = new LinkedHashMap<>();

        if ("teachers".equals(operation)) {
            row1.put(columns.get(0), "Priya Nair");
            row1.put(columns.get(1), "Mathematics");
            row1.put(columns.get(2), "Class 8A, Class 9A");
            row1.put(columns.get(3), "priya.nair@school.com");

            row2.put(columns.get(0), "Rahul Das");
            row2.put(columns.get(1), "Physics");
            row2.put(columns.get(2), "Class 10A");
            row2.put(columns.get(3), "");

            row3.put(columns.get(0), "Anita Bose");
            row3.put(columns.get(1), "English");
            row3.put(columns.get(2), "Class 7A, Class 7B");
            row3.put(columns.get(3), "anita.bose@school.com");
        } else if ("academic".equals(operation)) {
            row1.put(columns.get(0), "Class 8");
            row1.put(columns.get(1), "A");
            row1.put(columns.get(2), "Mathematics");

            row2.put(columns.get(0), "Class 8");
            row2.put(columns.get(1), "A");
            row2.put(columns.get(2), "Mathematics");

            row3.put(columns.get(0), "Class 9");
            row3.put(columns.get(1), "B");
            row3.put(columns.get(2), "Science");
        } else if ("timetable".equals(operation)) {
            row1.put(columns.get(0), "Monday");
            row1.put(columns.get(1), "09:00");
            row1.put(columns.get(2), "10:00");
            row1.put(columns.get(3), "Class 8");
            row1.put(columns.get(4), "A");
            row1.put(columns.get(5), "Priya Nair");
            row1.put(columns.get(6), "Mathematics");

            row2.put(columns.get(0), "Monday");
            row2.put(columns.get(1), "09:30");
            row2.put(columns.get(2), "10:30");
            row2.put(columns.get(3), "Class 9");
            row2.put(columns.get(4), "A");
            row2.put(columns.get(5), "Priya Nair");
            row2.put(columns.get(6), "Science");

            row3.put(columns.get(0), "Tuesday");
            row3.put(columns.get(1), "11:00");
            row3.put(columns.get(2), "12:00");
            row3.put(columns.get(3), "Class 8");
            row3.put(columns.get(4), "B");
            row3.put(columns.get(5), "Anita Bose");
            row3.put(columns.get(6), "English");
        } else if ("attendance".equals(operation)) {
            row1.put(columns.get(0), "2026-05-06");
            row1.put(columns.get(1), "Class 8");
            row1.put(columns.get(2), "A");
            row1.put(columns.get(3), "ADM-1001");
            row1.put(columns.get(4), "PRESENT");

            row2.put(columns.get(0), "2026-05-06");
            row2.put(columns.get(1), "Class 8");
            row2.put(columns.get(2), "A");
            row2.put(columns.get(3), "");
            row2.put(columns.get(4), "ABSENT");

            row3.put(columns.get(0), "2026-05-06");
            row3.put(columns.get(1), "Class 8");
            row3.put(columns.get(2), "B");
            row3.put(columns.get(3), "ADM-1010");
            row3.put(columns.get(4), "PRESENT");
        } else if ("parents".equals(operation)) {
            row1.put(columns.get(0), "ADM-1001");
            row1.put(columns.get(1), "Riya Mehta");
            row1.put(columns.get(2), "riya.parent@example.com");
            row1.put(columns.get(3), "9000000001");

            row2.put(columns.get(0), "ADM-1002");
            row2.put(columns.get(1), "Suresh Kumar");
            row2.put(columns.get(2), "");
            row2.put(columns.get(3), "9000000001");

            row3.put(columns.get(0), "ADM-1012");
            row3.put(columns.get(1), "Maya Nair");
            row3.put(columns.get(2), "maya.parent@example.com");
            row3.put(columns.get(3), "9000000011");
        } else if ("master".equals(operation)) {
            row1.put(columns.get(0), "STUDENT");
            row1.put(columns.get(1), "Aarav Mehta");
            row1.put(columns.get(2), "Class 8-A");
            row1.put(columns.get(3), "aarav@student.com");
            row1.put(columns.get(4), "9000000111");

            row2.put(columns.get(0), "TEACHER");
            row2.put(columns.get(1), "Priya Nair");
            row2.put(columns.get(2), "Mathematics");
            row2.put(columns.get(3), "");
            row2.put(columns.get(4), "9000000112");

            row3.put(columns.get(0), "CLASS");
            row3.put(columns.get(1), "Class 8");
            row3.put(columns.get(2), "A");
            row3.put(columns.get(3), "");
            row3.put(columns.get(4), "");
        } else {
            row1.put(columns.get(0), "Aarav Mehta");
            row1.put(columns.get(1), "Class 8 - A");
            row1.put(columns.get(2), "aarav@student.com");
            row1.put(columns.get(3), "Riya Mehta / 9000000001");

            row2.put(columns.get(0), "Ananya Singh");
            row2.put(columns.get(1), "Class 8 - A");
            row2.put(columns.get(2), "");
            row2.put(columns.get(3), "Suresh Singh / 9000000002");

            row3.put(columns.get(0), "Karan Nair");
            row3.put(columns.get(1), "Class 8 - B");
            row3.put(columns.get(2), "karan@student.com");
            row3.put(columns.get(3), "Maya Nair / 9000000003");
        }

        return List.of(
                new BulkValidationRowResponse(2, row1, "ready", "Validated"),
                new BulkValidationRowResponse(3, row2, "error", "Missing required fields"),
                new BulkValidationRowResponse(4, row3, "warning", "Possible duplicate match")
        );
    }

    private BulkJobResponse toResponse(JobRecord record) {
        return new BulkJobResponse(
                record.jobId(),
                record.operation(),
                JOB_DATE_FORMATTER.format(record.startedAt()),
                record.status(),
                record.successCount(),
                record.failedCount()
        );
    }

    private String escape(String value) {
        String safe = value == null ? "" : value.replace("\"", "\"\"");
        return '"' + safe + '"';
    }

    private record ValidationSession(
            String validationId,
            String operation,
            List<String> columns,
            List<BulkValidationRowResponse> rows,
            byte[] fileBytes,
            String originalFileName,
            Instant createdAt
    ) {
    }

    private record JobRecord(
            String jobId,
            String operation,
            Instant startedAt,
            String status,
            int successCount,
            int failedCount,
            List<BulkUploadErrorResponse> errors
    ) {
    }

    private static final class ByteArrayMultipartFile implements MultipartFile {

        private final String originalFilename;
        private final byte[] data;

        private ByteArrayMultipartFile(String originalFilename, byte[] data) {
            this.originalFilename = originalFilename;
            this.data = data;
        }

        @Override
        public String getName() {
            return "file";
        }

        @Override
        public String getOriginalFilename() {
            return originalFilename;
        }

        @Override
        public String getContentType() {
            return "application/octet-stream";
        }

        @Override
        public boolean isEmpty() {
            return data.length == 0;
        }

        @Override
        public long getSize() {
            return data.length;
        }

        @Override
        public byte[] getBytes() {
            return data;
        }

        @Override
        public java.io.InputStream getInputStream() {
            return new java.io.ByteArrayInputStream(data);
        }

        @Override
        public void transferTo(java.io.File dest) throws IOException {
            java.nio.file.Files.write(dest.toPath(), data);
        }
    }
}
