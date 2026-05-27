package com.cloudcampus.operations.document;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.ClassLevelRepository;
import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SchoolDocumentService {

    private final SchoolDocumentRepository schoolDocumentRepository;
    private final SchoolRepository schoolRepository;
    private final ClassLevelRepository classLevelRepository;
    private final StudentRepository studentRepository;
    private final SchoolAccessService schoolAccessService;
    private final AuditLogService auditLogService;

    public SchoolDocumentService(
            SchoolDocumentRepository schoolDocumentRepository,
            SchoolRepository schoolRepository,
            ClassLevelRepository classLevelRepository,
            StudentRepository studentRepository,
            SchoolAccessService schoolAccessService,
            AuditLogService auditLogService
    ) {
        this.schoolDocumentRepository = schoolDocumentRepository;
        this.schoolRepository = schoolRepository;
        this.classLevelRepository = classLevelRepository;
        this.studentRepository = studentRepository;
        this.schoolAccessService = schoolAccessService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public SchoolDocumentResponse create(AuthenticatedUser actor, SchoolDocumentRequest request) {
        School school = requireActiveSchoolAdminSchool(actor);
        ClassLevel classLevel = resolveClassLevel(actor, school, request.classLevelId());
        Student student = resolveStudent(actor, school, classLevel, request.studentId());
        SchoolDocument document = schoolDocumentRepository.save(new SchoolDocument(
                school,
                classLevel,
                student,
                actor.user(),
                request.title().trim(),
                request.fileName().trim(),
                request.storageKey().trim()
        ));
        recordCreated(actor.user(), document);
        return toResponse(document);
    }

    @Transactional(readOnly = true)
    public List<SchoolDocumentResponse> list(AuthenticatedUser actor) {
        School school = requireActiveSchoolAdminSchool(actor);
        return schoolDocumentRepository.findBySchoolIdOrderByCreatedAtDesc(school.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SchoolDocumentResponse read(AuthenticatedUser actor, String documentId) {
        SchoolDocument document = schoolDocumentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), document.getSchool().getId());
        return toResponse(document);
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

    private ClassLevel resolveClassLevel(AuthenticatedUser actor, School activeSchool, String classLevelId) {
        if (classLevelId == null || classLevelId.isBlank()) {
            return null;
        }
        ClassLevel classLevel = classLevelRepository.findById(classLevelId)
                .orElseThrow(() -> new NotFoundException("Class was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), classLevel.getSchool().getId());
        if (!activeSchool.getId().equals(classLevel.getSchool().getId())) {
            throw new ForbiddenException("Class does not belong to the active school.");
        }
        return classLevel;
    }

    private Student resolveStudent(AuthenticatedUser actor, School activeSchool, ClassLevel classLevel, String studentId) {
        if (studentId == null || studentId.isBlank()) {
            return null;
        }
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), student.getSchool().getId());
        if (!activeSchool.getId().equals(student.getSchool().getId())) {
            throw new ForbiddenException("Student does not belong to the active school.");
        }
        if (classLevel != null
                && student.getClassLevel() != null
                && !classLevel.getId().equals(student.getClassLevel().getId())) {
            throw new ForbiddenException("Student does not belong to the selected class.");
        }
        return student;
    }

    private SchoolDocumentResponse toResponse(SchoolDocument document) {
        ClassLevel classLevel = document.getClassLevel();
        Student student = document.getStudent();
        return new SchoolDocumentResponse(
                document.getId(),
                document.getTenant().getId(),
                document.getSchool().getId(),
                classLevel == null ? null : classLevel.getId(),
                classLevel == null ? null : classLevel.getName(),
                student == null ? null : student.getId(),
                student == null ? null : student.getFullName(),
                document.getTitle(),
                document.getFileName(),
                document.getStorageKey(),
                document.getCreatedAt()
        );
    }

    private void recordCreated(UserAccount actor, SchoolDocument document) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("classLevelId", document.getClassLevel() == null ? null : document.getClassLevel().getId());
        metadata.put("studentId", document.getStudent() == null ? null : document.getStudent().getId());
        metadata.put("fileName", document.getFileName());
        auditLogService.record(
                document.getTenant().getId(),
                document.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.DOCUMENT_CREATED,
                "SchoolDocument",
                document.getId(),
                "School document created",
                metadata
        );
    }
}
