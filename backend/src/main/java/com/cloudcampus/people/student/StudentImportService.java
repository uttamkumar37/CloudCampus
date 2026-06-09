package com.cloudcampus.people.student;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.ClassLevelRepository;
import com.cloudcampus.academic.Section;
import com.cloudcampus.academic.SectionRepository;
import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.PageResponse;
import com.cloudcampus.common.web.PageResponses;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.operations.bulk.BulkJob;
import com.cloudcampus.operations.bulk.BulkJobCreateRequest;
import com.cloudcampus.operations.bulk.BulkJobProgressRequest;
import com.cloudcampus.operations.bulk.BulkJobRepository;
import com.cloudcampus.operations.bulk.BulkJobResponse;
import com.cloudcampus.operations.bulk.BulkJobService;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentImportService {

    private static final int MAX_IMPORT_ROWS = 500;
    private static final String EMAIL_PATTERN = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$";

    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;
    private final ClassLevelRepository classLevelRepository;
    private final SectionRepository sectionRepository;
    private final StudentImportJobRepository studentImportJobRepository;
    private final BulkJobRepository bulkJobRepository;
    private final BulkJobService bulkJobService;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    public StudentImportService(
            StudentRepository studentRepository,
            SchoolRepository schoolRepository,
            ClassLevelRepository classLevelRepository,
            SectionRepository sectionRepository,
            StudentImportJobRepository studentImportJobRepository,
            BulkJobRepository bulkJobRepository,
            BulkJobService bulkJobService,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService,
            ObjectMapper objectMapper
    ) {
        this.studentRepository = studentRepository;
        this.schoolRepository = schoolRepository;
        this.classLevelRepository = classLevelRepository;
        this.sectionRepository = sectionRepository;
        this.studentImportJobRepository = studentImportJobRepository;
        this.bulkJobRepository = bulkJobRepository;
        this.bulkJobService = bulkJobService;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public StudentImportTemplateResponse template(AuthenticatedUser actor) {
        requireActiveSchoolAdminSchool(actor);
        return new StudentImportTemplateResponse(
                List.of("admissionNumber", "fullName", "classLevelId", "sectionId"),
                List.of("rollNumber", "dateOfBirth", "gender", "guardianName", "guardianEmail", "guardianMobile"),
                new StudentImportRow(
                        "ADM-1001",
                        "Student Name",
                        "class-level-id",
                        "section-id",
                        "1",
                        "2016-04-15",
                        "Female",
                        "Guardian Name",
                        "guardian@example.com",
                        "+919876543210"
                )
        );
    }

    @Transactional(readOnly = true)
    public StudentImportValidationResponse validateImport(AuthenticatedUser actor, StudentImportRequest request) {
        School school = requireActiveSchoolAdminSchool(actor);
        List<StudentImportError> errors = validateRows(actor, school, request.rows()).errors();
        return new StudentImportValidationResponse(errors.isEmpty(), request.rows().size(), errors);
    }

    @Transactional
    public StudentImportResponse importStudents(AuthenticatedUser actor, StudentImportRequest request) {
        School school = requireActiveSchoolAdminSchool(actor);
        ResolvedImportRows resolved = validateRows(actor, school, request.rows());
        if (!resolved.errors().isEmpty()) {
            return new StudentImportResponse(false, 0, List.of(), resolved.errors());
        }

        List<Student> saved = persistStudents(actor.user(), school, resolved.rows());
        return new StudentImportResponse(
                true,
                saved.size(),
                saved.stream().map(this::toResponse).toList(),
                List.of()
        );
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> students(AuthenticatedUser actor) {
        School school = requireActiveStudentRecordSchool(actor);
        return studentRepository.findBySchoolIdOrderByAdmissionNumberAsc(school.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<StudentResponse> students(AuthenticatedUser actor, int page, int size, String search, String status) {
        School school = requireActiveStudentRecordSchool(actor);
        String normalizedSearch = normalizeOptional(search);
        String normalizedStatus = normalizeOptional(status);
        List<StudentResponse> rows = studentRepository.findBySchoolIdOrderByAdmissionNumberAsc(school.getId())
                .stream()
                .map(this::toResponse)
                .filter(student -> matchesStatus(student, normalizedStatus))
                .filter(student -> matchesSearch(student, normalizedSearch))
                .toList();
        return PageResponses.of(rows, page, size);
    }

    @Transactional
    public StudentImportJobResponse queueImportJob(AuthenticatedUser actor, StudentImportRequest request) {
        School school = requireActiveSchoolAdminSchool(actor);
        validateRows(actor, school, request.rows());
        BulkJobResponse bulkJobResponse = bulkJobService.create(
                actor,
                new BulkJobCreateRequest(
                        "STUDENT_IMPORT",
                        request.rows().size(),
                        null,
                        Map.of("source", "student-import", "rowCount", request.rows().size())
                )
        );
        BulkJob bulkJob = bulkJobRepository.findById(bulkJobResponse.id())
                .orElseThrow(() -> new NotFoundException("Bulk job was not found."));
        StudentImportJob importJob = studentImportJobRepository.save(new StudentImportJob(
                school.getTenant(),
                school,
                bulkJob,
                actor.user(),
                rowsJson(request.rows())
        ));
        recordStudentImportJobQueued(actor.user(), school, importJob, request.rows().size());
        return toImportJobResponse(importJob, bulkJobResponse);
    }

    @Transactional(readOnly = true)
    public StudentImportJobResponse importJob(AuthenticatedUser actor, String bulkJobId) {
        BulkJobResponse bulkJobResponse = bulkJobService.get(actor, bulkJobId);
        StudentImportJob importJob = requireImportJob(bulkJobId);
        return toImportJobResponse(importJob, bulkJobResponse);
    }

    @Transactional
    public StudentImportJobResponse processQueuedImportJob(String bulkJobId) {
        StudentImportJob importJob = requireImportJob(bulkJobId);
        BulkJob bulkJob = importJob.getBulkJob();
        AuthenticatedUser actor = new AuthenticatedUser(bulkJob.getRequestedBy(), bulkJob.getSchool().getId());
        bulkJobService.markValidating(bulkJobId);

        School school = requireActiveSchoolAdminSchool(actor);
        List<StudentImportRow> rows = rows(importJob);
        ResolvedImportRows resolved = validateRows(actor, school, rows);
        int failedRows = failedRowCount(resolved.errors());
        int successRows = resolved.rows().size();

        if (successRows > 0) {
            bulkJobService.markProcessing(bulkJobId);
            persistStudents(actor.user(), school, resolved.rows());
        }
        if (!resolved.errors().isEmpty()) {
            importJob.recordValidationErrors(validationErrorsJson(resolved.errors()));
        } else {
            importJob.markProcessed();
        }
        bulkJobService.updateProgress(
                bulkJobId,
                new BulkJobProgressRequest(
                        rows.size(),
                        successRows,
                        failedRows,
                        failedRows == 0 ? null : "student-import-errors:" + bulkJobId
                )
        );
        BulkJobResponse completed = bulkJobService.markCompleted(bulkJobId);
        return toImportJobResponse(importJob, completed);
    }

    private School requireActiveSchoolAdminSchool(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), activeSchoolId);
        return schoolRepository.findById(activeSchoolId)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private School requireActiveStudentRecordSchool(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolStudentRecordAccess(actor.user().getId(), activeSchoolId);
        return schoolRepository.findById(activeSchoolId)
                .orElseThrow(() -> new NotFoundException("Active school was not found."));
    }

    private boolean matchesStatus(StudentResponse student, String status) {
        if (status == null || status.equalsIgnoreCase("all")) {
            return true;
        }
        if (status.equalsIgnoreCase("active")) {
            return student.active();
        }
        if (status.equalsIgnoreCase("inactive")) {
            return !student.active();
        }
        return true;
    }

    private boolean matchesSearch(StudentResponse student, String search) {
        if (search == null) {
            return true;
        }
        String query = search.toLowerCase(Locale.ROOT);
        return contains(student.fullName(), query)
                || contains(student.admissionNumber(), query)
                || contains(student.rollNumber(), query)
                || contains(student.guardianName(), query)
                || contains(student.guardianEmail(), query)
                || contains(student.guardianMobile(), query)
                || contains(student.classLevelId(), query)
                || contains(student.sectionId(), query);
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private ResolvedImportRows validateRows(AuthenticatedUser actor, School school, List<StudentImportRow> rows) {
        if (rows.size() > MAX_IMPORT_ROWS) {
            throw new BadRequestException("Student import can include at most " + MAX_IMPORT_ROWS + " rows.");
        }

        List<StudentImportError> errors = new ArrayList<>();
        List<ResolvedStudentImportRow> resolvedRows = new ArrayList<>();
        Set<String> seenAdmissionNumbers = new HashSet<>();
        Map<String, ClassLevel> classCache = new HashMap<>();
        Map<String, Section> sectionCache = new HashMap<>();

        for (int index = 0; index < rows.size(); index++) {
            int rowNumber = index + 1;
            StudentImportRow row = rows.get(index);
            if (row == null) {
                errors.add(new StudentImportError(rowNumber, "row", "Row is required."));
                continue;
            }

            String admissionNumber = normalizeRequired(row.admissionNumber(), rowNumber, "admissionNumber", errors);
            String fullName = normalizeRequired(row.fullName(), rowNumber, "fullName", errors);
            String classLevelId = normalizeRequired(row.classLevelId(), rowNumber, "classLevelId", errors);
            String sectionId = normalizeRequired(row.sectionId(), rowNumber, "sectionId", errors);
            String rollNumber = normalizeOptional(row.rollNumber());
            LocalDate dateOfBirth = parseDate(row.dateOfBirth(), rowNumber, errors);
            String gender = normalizeOptional(row.gender());
            String guardianName = normalizeOptional(row.guardianName());
            String guardianEmail = normalizeEmail(row.guardianEmail(), rowNumber, errors);
            String guardianMobile = normalizeOptional(row.guardianMobile());

            if (admissionNumber != null && !seenAdmissionNumbers.add(admissionNumber.toUpperCase(Locale.ROOT))) {
                errors.add(new StudentImportError(rowNumber, "admissionNumber", "Duplicate admission number in import."));
            }
            if (admissionNumber != null && studentRepository.existsBySchoolIdAndAdmissionNumber(school.getId(), admissionNumber)) {
                errors.add(new StudentImportError(rowNumber, "admissionNumber", "Admission number already exists for this school."));
            }

            ClassLevel classLevel = classLevelId == null ? null : resolveClassLevel(actor, school, classLevelId, rowNumber, errors, classCache);
            Section section = sectionId == null ? null : resolveSection(actor, school, sectionId, rowNumber, errors, sectionCache);
            if (classLevel != null && section != null && !section.getClassLevel().getId().equals(classLevel.getId())) {
                errors.add(new StudentImportError(rowNumber, "sectionId", "Section does not belong to the selected class."));
            }

            if (errors.stream().noneMatch(error -> error.rowNumber() == rowNumber)) {
                resolvedRows.add(new ResolvedStudentImportRow(
                        admissionNumber,
                        fullName,
                        classLevel,
                        section,
                        rollNumber,
                        dateOfBirth,
                        gender,
                        guardianName,
                        guardianEmail,
                        guardianMobile
                ));
            }
        }

        return new ResolvedImportRows(resolvedRows, errors);
    }

    private StudentImportJob requireImportJob(String bulkJobId) {
        return studentImportJobRepository.findByBulkJobId(bulkJobId)
                .orElseThrow(() -> new NotFoundException("Student import job was not found."));
    }

    private List<Student> persistStudents(UserAccount actor, School school, List<ResolvedStudentImportRow> rows) {
        Instant importedAt = Instant.now();
        List<Student> students = rows
                .stream()
                .map(row -> new Student(
                        school.getTenant(),
                        school,
                        row.admissionNumber(),
                        row.fullName(),
                        row.classLevel(),
                        row.section(),
                        row.rollNumber(),
                        row.dateOfBirth(),
                        row.gender(),
                        row.guardianName(),
                        row.guardianEmail(),
                        row.guardianMobile(),
                        importedAt
                ))
                .toList();
        List<Student> saved = studentRepository.saveAll(students);
        if (!saved.isEmpty()) {
            recordStudentsImported(actor, school, saved);
        }
        return saved;
    }

    private ClassLevel resolveClassLevel(
            AuthenticatedUser actor,
            School activeSchool,
            String classLevelId,
            int rowNumber,
            List<StudentImportError> errors,
            Map<String, ClassLevel> cache
    ) {
        ClassLevel classLevel = cache.computeIfAbsent(classLevelId, id -> classLevelRepository.findById(id).orElse(null));
        if (classLevel == null) {
            errors.add(new StudentImportError(rowNumber, "classLevelId", "Class was not found."));
            return null;
        }
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), classLevel.getSchool().getId());
        if (!classLevel.getSchool().getId().equals(activeSchool.getId())) {
            throw new ForbiddenException("Class does not belong to the active school.");
        }
        return classLevel;
    }

    private Section resolveSection(
            AuthenticatedUser actor,
            School activeSchool,
            String sectionId,
            int rowNumber,
            List<StudentImportError> errors,
            Map<String, Section> cache
    ) {
        Section section = cache.computeIfAbsent(sectionId, id -> sectionRepository.findById(id).orElse(null));
        if (section == null) {
            errors.add(new StudentImportError(rowNumber, "sectionId", "Section was not found."));
            return null;
        }
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), section.getSchool().getId());
        if (!section.getSchool().getId().equals(activeSchool.getId())) {
            throw new ForbiddenException("Section does not belong to the active school.");
        }
        return section;
    }

    private String normalizeRequired(String value, int rowNumber, String field, List<StudentImportError> errors) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            errors.add(new StudentImportError(rowNumber, field, "Value is required."));
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String normalizeEmail(String value, int rowNumber, List<StudentImportError> errors) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            return null;
        }
        String email = normalized.toLowerCase(Locale.ROOT);
        if (!email.matches(EMAIL_PATTERN)) {
            errors.add(new StudentImportError(rowNumber, "guardianEmail", "Guardian email is invalid."));
        }
        return email;
    }

    private LocalDate parseDate(String value, int rowNumber, List<StudentImportError> errors) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            return null;
        }
        try {
            return LocalDate.parse(normalized);
        } catch (DateTimeParseException ex) {
            errors.add(new StudentImportError(rowNumber, "dateOfBirth", "Date must use ISO format yyyy-MM-dd."));
            return null;
        }
    }

    private void recordStudentsImported(UserAccount actor, School school, List<Student> students) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.STUDENT_IMPORTED,
                "StudentImport",
                students.get(0).getId(),
                "Student import completed.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "importedCount", students.size(),
                        "studentIds", students.stream().map(Student::getId).toList()
                )
        );
    }

    private void recordStudentImportJobQueued(UserAccount actor, School school, StudentImportJob importJob, int rowCount) {
        auditLogService.record(
                school.getTenant().getId(),
                school.getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.STUDENT_IMPORT_JOB_QUEUED,
                "StudentImportJob",
                importJob.getId(),
                "Student import job queued.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", school.getTenant().getId(),
                        "schoolId", school.getId(),
                        "studentImportJobId", importJob.getId(),
                        "bulkJobId", importJob.getBulkJob().getId(),
                        "rowCount", rowCount
                )
        );
    }

    private StudentResponse toResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getTenant().getId(),
                student.getSchool().getId(),
                student.getAdmissionNumber(),
                student.getFullName(),
                student.getClassLevel() == null ? null : student.getClassLevel().getId(),
                student.getSection() == null ? null : student.getSection().getId(),
                student.getRollNumber(),
                student.getDateOfBirth(),
                student.getGender(),
                student.getGuardianName(),
                student.getGuardianEmail(),
                student.getGuardianMobile(),
                student.isActive()
        );
    }

    private StudentImportJobResponse toImportJobResponse(StudentImportJob importJob, BulkJobResponse bulkJob) {
        return new StudentImportJobResponse(
                importJob.getId(),
                bulkJob.id(),
                bulkJob.tenantId(),
                bulkJob.schoolId(),
                bulkJob.status(),
                bulkJob.totalRecords(),
                bulkJob.processedRecords(),
                bulkJob.successRecords(),
                bulkJob.failedRecords(),
                bulkJob.errorFileReference(),
                validationErrors(importJob),
                importJob.getCreatedAt(),
                importJob.getProcessedAt()
        );
    }

    private String rowsJson(List<StudentImportRow> rows) {
        try {
            return objectMapper.writeValueAsString(rows);
        } catch (JsonProcessingException exception) {
            throw new BadRequestException("Student import rows must be JSON serializable.");
        }
    }

    private List<StudentImportRow> rows(StudentImportJob importJob) {
        try {
            return objectMapper.readValue(importJob.getRowsJson(), new TypeReference<List<StudentImportRow>>() {
            });
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Student import job rows could not be read.", exception);
        }
    }

    private String validationErrorsJson(List<StudentImportError> errors) {
        try {
            return objectMapper.writeValueAsString(errors);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Student import validation errors could not be serialized.", exception);
        }
    }

    private List<StudentImportError> validationErrors(StudentImportJob importJob) {
        try {
            return objectMapper.readValue(importJob.getValidationErrorsJson(), new TypeReference<List<StudentImportError>>() {
            });
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Student import validation errors could not be read.", exception);
        }
    }

    private int failedRowCount(List<StudentImportError> errors) {
        return (int) errors.stream()
                .map(StudentImportError::rowNumber)
                .distinct()
                .count();
    }

    private record ResolvedImportRows(
            List<ResolvedStudentImportRow> rows,
            List<StudentImportError> errors
    ) {
    }

    private record ResolvedStudentImportRow(
            String admissionNumber,
            String fullName,
            ClassLevel classLevel,
            Section section,
            String rollNumber,
            LocalDate dateOfBirth,
            String gender,
            String guardianName,
            String guardianEmail,
            String guardianMobile
    ) {
    }
}
