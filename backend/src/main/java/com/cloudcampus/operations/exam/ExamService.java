package com.cloudcampus.operations.exam;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.cloudcampus.academic.AcademicAssignmentService;
import com.cloudcampus.academic.ClassLevel;
import com.cloudcampus.academic.ClassLevelRepository;
import com.cloudcampus.academic.ClassSubjectAssignment;
import com.cloudcampus.academic.ClassSubjectAssignmentRepository;
import com.cloudcampus.academic.Section;
import com.cloudcampus.academic.SectionRepository;
import com.cloudcampus.academic.TeacherAssignment;
import com.cloudcampus.audit.AuditAction;
import com.cloudcampus.audit.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ForbiddenException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.identity.accesscontrol.SchoolAccessService;
import com.cloudcampus.identity.auth.UserAccount;
import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.identity.auth.session.AuthenticatedUser;
import com.cloudcampus.people.parent.ParentStudentLinkRepository;
import com.cloudcampus.people.student.Student;
import com.cloudcampus.people.student.StudentRepository;
import com.cloudcampus.school.School;
import com.cloudcampus.school.SchoolRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamResultRepository examResultRepository;
    private final ClassLevelRepository classLevelRepository;
    private final SectionRepository sectionRepository;
    private final ClassSubjectAssignmentRepository classSubjectAssignmentRepository;
    private final StudentRepository studentRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final AcademicAssignmentService academicAssignmentService;
    private final AuditLogService auditLogService;

    public ExamService(
            ExamRepository examRepository,
            ExamResultRepository examResultRepository,
            ClassLevelRepository classLevelRepository,
            SectionRepository sectionRepository,
            ClassSubjectAssignmentRepository classSubjectAssignmentRepository,
            StudentRepository studentRepository,
            ParentStudentLinkRepository parentStudentLinkRepository,
            SchoolRepository schoolRepository,
            SchoolAccessService schoolAccessService,
            AcademicAssignmentService academicAssignmentService,
            AuditLogService auditLogService
    ) {
        this.examRepository = examRepository;
        this.examResultRepository = examResultRepository;
        this.classLevelRepository = classLevelRepository;
        this.sectionRepository = sectionRepository;
        this.classSubjectAssignmentRepository = classSubjectAssignmentRepository;
        this.studentRepository = studentRepository;
        this.parentStudentLinkRepository = parentStudentLinkRepository;
        this.schoolRepository = schoolRepository;
        this.schoolAccessService = schoolAccessService;
        this.academicAssignmentService = academicAssignmentService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ExamResponse createSchoolAdminExam(AuthenticatedUser actor, ExamRequest request) {
        School activeSchool = requireActiveSchoolAdminSchool(actor);
        ClassLevel classLevel = requireClassLevelSchoolAdminAccess(actor, request.classLevelId());
        if (!classLevel.getSchool().getId().equals(activeSchool.getId())) {
            throw new ForbiddenException("Class does not belong to the active school.");
        }
        ClassSubjectAssignment classSubject = requireClassSubject(classLevel, request.subjectId());
        Section section = requireSectionForClass(classLevel, request.sectionId());
        Exam exam = examRepository.save(new Exam(
                classLevel,
                section,
                classSubject.getSubject(),
                actor.user(),
                request.title().trim(),
                request.examDate(),
                request.maxMarks()
        ));
        recordExamCreated(actor.user(), exam);
        return toResponse(exam, List.of());
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> schoolExams(AuthenticatedUser actor) {
        School school = requireActiveSchoolAdminSchool(actor);
        return examRepository.findBySchoolIdOrderByExamDateAscCreatedAtAsc(school.getId())
                .stream()
                .map(this::toResponseWithResults)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExamResponse schoolExam(AuthenticatedUser actor, String examId) {
        Exam exam = requireExam(examId);
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), exam.getSchool().getId());
        return toResponseWithResults(exam);
    }

    @Transactional
    public ExamResponse recordSchoolAdminMarks(AuthenticatedUser actor, String examId, ExamMarksRequest request) {
        Exam exam = requireExam(examId);
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), exam.getSchool().getId());
        ExamResult result = recordMarks(actor.user(), exam, request);
        return toResponse(exam, List.of(result));
    }

    @Transactional
    public ExamResponse publishSchoolAdminExam(AuthenticatedUser actor, String examId) {
        Exam exam = requireExam(examId);
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), exam.getSchool().getId());
        exam.publish(actor.user(), Instant.now());
        recordExamResultsPublished(actor.user(), exam);
        return toResponseWithResults(exam);
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> teacherExams(AuthenticatedUser teacher, String classLevelId, String subjectId) {
        TeacherAssignment assignment = academicAssignmentService.requireTeacherAssignment(teacher, classLevelId, subjectId);
        return examRepository.findBySchoolIdAndClassLevelIdAndSubjectIdOrderByExamDateAscCreatedAtAsc(
                        assignment.getSchool().getId(),
                        classLevelId,
                        subjectId
                )
                .stream()
                .map(this::toResponseWithResults)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExamResponse teacherExam(AuthenticatedUser teacher, String examId) {
        Exam exam = requireExam(examId);
        academicAssignmentService.requireTeacherAssignment(
                teacher,
                exam.getClassLevel().getId(),
                exam.getSubject().getId()
        );
        return toResponseWithResults(exam);
    }

    @Transactional(readOnly = true)
    public List<ExamRosterStudentResponse> teacherExamRoster(AuthenticatedUser teacher, String examId) {
        Exam exam = requireExam(examId);
        academicAssignmentService.requireTeacherAssignment(
                teacher,
                exam.getClassLevel().getId(),
                exam.getSubject().getId()
        );
        Map<String, ExamResult> resultsByStudentId = examResultRepository
                .findByExamIdOrderByStudentAdmissionNumberAsc(exam.getId())
                .stream()
                .collect(java.util.stream.Collectors.toMap(result -> result.getStudent().getId(), result -> result));
        return studentsForExam(exam)
                .stream()
                .map(student -> toRosterStudentResponse(exam, student, resultsByStudentId.get(student.getId())))
                .toList();
    }

    @Transactional
    public ExamResponse recordTeacherMarks(AuthenticatedUser teacher, String examId, ExamMarksRequest request) {
        Exam exam = requireExam(examId);
        academicAssignmentService.requireTeacherAssignment(
                teacher,
                exam.getClassLevel().getId(),
                exam.getSubject().getId()
        );
        ExamResult result = recordMarks(teacher.user(), exam, request);
        return toResponse(exam, List.of(result));
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> parentChildResults(AuthenticatedUser actor, String studentId) {
        Student student = requireParentLinkedToStudent(actor, studentId);
        return publishedResultsForStudent(student)
                .stream()
                .map(result -> toResponse(result.getExam(), List.of(result)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> studentResults(AuthenticatedUser actor) {
        Student student = requireStudentProfile(actor);
        return publishedResultsForStudent(student)
                .stream()
                .map(result -> toResponse(result.getExam(), List.of(result)))
                .toList();
    }

    private ExamResult recordMarks(UserAccount actor, Exam exam, ExamMarksRequest request) {
        Student student = requireStudentForExam(exam, request.studentId());
        requireMarksWithinRange(exam, request.marksObtained());
        ExamResult result = examResultRepository.findByExamIdAndStudentId(exam.getId(), student.getId())
                .map(existing -> {
                    existing.updateMarks(actor, request.marksObtained());
                    return existing;
                })
                .orElseGet(() -> examResultRepository.save(new ExamResult(exam, student, actor, request.marksObtained())));
        recordMarksRecorded(actor, result);
        return result;
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

    private ClassLevel requireClassLevelSchoolAdminAccess(AuthenticatedUser actor, String classLevelId) {
        ClassLevel classLevel = classLevelRepository.findById(classLevelId)
                .orElseThrow(() -> new NotFoundException("Class was not found."));
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), classLevel.getSchool().getId());
        return classLevel;
    }

    private ClassSubjectAssignment requireClassSubject(ClassLevel classLevel, String subjectId) {
        ClassSubjectAssignment classSubject = classSubjectAssignmentRepository
                .findByClassLevelIdAndSubjectId(classLevel.getId(), subjectId)
                .orElseThrow(() -> new ForbiddenException("Subject is not assigned to this class."));
        if (!classSubject.getSchool().getId().equals(classLevel.getSchool().getId())) {
            throw new ForbiddenException("Class subject assignment school scope is invalid.");
        }
        return classSubject;
    }

    private Section requireSectionForClass(ClassLevel classLevel, String sectionId) {
        if (sectionId == null || sectionId.isBlank()) {
            return null;
        }
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("Section was not found."));
        if (!section.getClassLevel().getId().equals(classLevel.getId())
                || !section.getSchool().getId().equals(classLevel.getSchool().getId())) {
            throw new ForbiddenException("Section does not belong to this class.");
        }
        return section;
    }

    private Student requireStudentForExam(Exam exam, String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student was not found."));
        if (!student.isActive()
                || !student.getTenant().getId().equals(exam.getTenant().getId())
                || !student.getSchool().getId().equals(exam.getSchool().getId())
                || student.getClassLevel() == null
                || !student.getClassLevel().getId().equals(exam.getClassLevel().getId())) {
            throw new ForbiddenException("Student is not in this exam scope.");
        }
        if (exam.getSection() != null
                && (student.getSection() == null || !exam.getSection().getId().equals(student.getSection().getId()))) {
            throw new ForbiddenException("Student is not in this exam section.");
        }
        return student;
    }

    private List<Student> studentsForExam(Exam exam) {
        if (exam.getSection() == null) {
            return studentRepository.findBySchoolIdAndClassLevelIdAndActiveTrueOrderByAdmissionNumberAsc(
                    exam.getSchool().getId(),
                    exam.getClassLevel().getId()
            );
        }
        return studentRepository.findBySchoolIdAndClassLevelIdAndSectionIdAndActiveTrueOrderByAdmissionNumberAsc(
                exam.getSchool().getId(),
                exam.getClassLevel().getId(),
                exam.getSection().getId()
        );
    }

    private void requireMarksWithinRange(Exam exam, BigDecimal marksObtained) {
        if (marksObtained.compareTo(BigDecimal.ZERO) < 0 || marksObtained.compareTo(exam.getMaxMarks()) > 0) {
            throw new BadRequestException("Marks must be between zero and the exam maximum.");
        }
    }

    private Student requireParentLinkedToStudent(AuthenticatedUser actor, String studentId) {
        if (actor.user().getRole() != UserRole.PARENT) {
            throw new ForbiddenException("Parent access is required.");
        }
        return parentStudentLinkRepository.findByParentUserIdAndStudentId(actor.user().getId(), studentId)
                .filter(link -> link.getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getStudent().getTenant().getId().equals(actor.user().getTenant().getId()))
                .map(link -> link.getStudent())
                .orElseThrow(() -> new ForbiddenException("Parent is not linked to this child."));
    }

    private Student requireStudentProfile(AuthenticatedUser actor) {
        if (actor.user().getRole() != UserRole.STUDENT) {
            throw new ForbiddenException("Student access is required.");
        }
        return studentRepository.findByUserId(actor.user().getId())
                .filter(student -> student.getTenant().getId().equals(actor.user().getTenant().getId()))
                .orElseThrow(() -> new ForbiddenException("Student profile is not linked to this user."));
    }

    private List<ExamResult> publishedResultsForStudent(Student student) {
        if (!student.isActive() || student.getClassLevel() == null) {
            return List.of();
        }
        return examResultRepository.findByStudentIdAndExamStatusOrderByExamExamDateAsc(student.getId(), ExamStatus.PUBLISHED)
                .stream()
                .filter(result -> result.getSchool().getId().equals(student.getSchool().getId()))
                .toList();
    }

    private Exam requireExam(String examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new NotFoundException("Exam was not found."));
    }

    private ExamResponse toResponseWithResults(Exam exam) {
        return toResponse(exam, examResultRepository.findByExamIdOrderByStudentAdmissionNumberAsc(exam.getId()));
    }

    private ExamResponse toResponse(Exam exam, List<ExamResult> results) {
        Section section = exam.getSection();
        return new ExamResponse(
                exam.getId(),
                exam.getTenant().getId(),
                exam.getSchool().getId(),
                exam.getClassLevel().getId(),
                exam.getClassLevel().getName(),
                section == null ? null : section.getId(),
                section == null ? null : section.getName(),
                exam.getSubject().getId(),
                exam.getSubject().getCode(),
                exam.getSubject().getName(),
                exam.getTitle(),
                exam.getExamDate(),
                exam.getMaxMarks(),
                exam.getStatus(),
                exam.getCreatedByUser().getId(),
                exam.getPublishedByUser() == null ? null : exam.getPublishedByUser().getId(),
                exam.getCreatedAt(),
                exam.getPublishedAt(),
                results.stream().map(this::toResultResponse).toList()
        );
    }

    private ExamResultResponse toResultResponse(ExamResult result) {
        return new ExamResultResponse(
                result.getId(),
                result.getStudent().getId(),
                result.getStudent().getFullName(),
                result.getRecordedByUser().getId(),
                result.getMarksObtained(),
                result.getRecordedAt()
        );
    }

    private ExamRosterStudentResponse toRosterStudentResponse(Exam exam, Student student, ExamResult result) {
        Section section = student.getSection();
        return new ExamRosterStudentResponse(
                student.getId(),
                student.getAdmissionNumber(),
                student.getFullName(),
                exam.getClassLevel().getId(),
                exam.getClassLevel().getName(),
                section == null ? null : section.getId(),
                section == null ? null : section.getName(),
                student.getRollNumber(),
                result == null ? null : result.getId(),
                result == null ? null : result.getMarksObtained(),
                result == null ? null : result.getRecordedAt()
        );
    }

    private void recordExamCreated(UserAccount actor, Exam exam) {
        auditLogService.record(
                exam.getTenant().getId(),
                exam.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.EXAM_CREATED,
                "Exam",
                exam.getId(),
                "Exam created.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", exam.getTenant().getId(),
                        "schoolId", exam.getSchool().getId(),
                        "examId", exam.getId(),
                        "classLevelId", exam.getClassLevel().getId(),
                        "sectionId", exam.getSection() == null ? "" : exam.getSection().getId(),
                        "subjectId", exam.getSubject().getId()
                )
        );
    }

    private void recordMarksRecorded(UserAccount actor, ExamResult result) {
        auditLogService.record(
                result.getTenant().getId(),
                result.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.EXAM_MARKS_RECORDED,
                "ExamResult",
                result.getId(),
                "Exam marks recorded.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", result.getTenant().getId(),
                        "schoolId", result.getSchool().getId(),
                        "examId", result.getExam().getId(),
                        "resultId", result.getId(),
                        "studentId", result.getStudent().getId()
                )
        );
    }

    private void recordExamResultsPublished(UserAccount actor, Exam exam) {
        auditLogService.record(
                exam.getTenant().getId(),
                exam.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.EXAM_RESULTS_PUBLISHED,
                "Exam",
                exam.getId(),
                "Exam results published.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", exam.getTenant().getId(),
                        "schoolId", exam.getSchool().getId(),
                        "examId", exam.getId(),
                        "classLevelId", exam.getClassLevel().getId(),
                        "subjectId", exam.getSubject().getId()
                )
        );
    }
}
