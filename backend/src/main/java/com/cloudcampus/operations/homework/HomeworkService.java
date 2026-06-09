package com.cloudcampus.operations.homework;

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
import com.cloudcampus.common.exception.ConflictException;
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
public class HomeworkService {

    private final HomeworkRepository homeworkRepository;
    private final HomeworkSubmissionRepository homeworkSubmissionRepository;
    private final ClassLevelRepository classLevelRepository;
    private final SectionRepository sectionRepository;
    private final ClassSubjectAssignmentRepository classSubjectAssignmentRepository;
    private final StudentRepository studentRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final AcademicAssignmentService academicAssignmentService;
    private final AuditLogService auditLogService;

    public HomeworkService(
            HomeworkRepository homeworkRepository,
            HomeworkSubmissionRepository homeworkSubmissionRepository,
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
        this.homeworkRepository = homeworkRepository;
        this.homeworkSubmissionRepository = homeworkSubmissionRepository;
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
    public HomeworkResponse createSchoolAdminHomework(AuthenticatedUser actor, HomeworkRequest request) {
        School activeSchool = requireActiveSchoolAdminSchool(actor);
        ClassLevel classLevel = requireClassLevelSchoolAdminAccess(actor, request.classLevelId());
        if (!classLevel.getSchool().getId().equals(activeSchool.getId())) {
            throw new ForbiddenException("Class does not belong to the active school.");
        }
        ClassSubjectAssignment classSubject = requireClassSubject(classLevel, request.subjectId());
        Section section = requireSectionForClass(classLevel, request.sectionId());
        return createHomework(actor.user(), classLevel, section, classSubject, request);
    }

    @Transactional(readOnly = true)
    public List<HomeworkResponse> schoolHomework(AuthenticatedUser actor) {
        School school = requireActiveSchoolAdminSchool(actor);
        return homeworkRepository.findBySchoolIdOrderByDueDateAscCreatedAtAsc(school.getId())
                .stream()
                .map(this::toResponseWithAllSubmissions)
                .toList();
    }

    @Transactional(readOnly = true)
    public HomeworkResponse schoolHomework(AuthenticatedUser actor, String homeworkId) {
        Homework homework = requireHomework(homeworkId);
        schoolAccessService.requireSchoolAdminAccess(actor.user().getId(), homework.getSchool().getId());
        return toResponseWithAllSubmissions(homework);
    }

    @Transactional
    public HomeworkResponse createTeacherHomework(AuthenticatedUser actor, HomeworkRequest request) {
        TeacherAssignment assignment = academicAssignmentService.requireTeacherAssignment(
                actor,
                request.classLevelId(),
                request.subjectId()
        );
        ClassLevel classLevel = assignment.getClassSubjectAssignment().getClassLevel();
        Section section = requireSectionForClass(classLevel, request.sectionId());
        return createHomework(actor.user(), classLevel, section, assignment.getClassSubjectAssignment(), request);
    }

    @Transactional(readOnly = true)
    public List<HomeworkResponse> teacherHomework(AuthenticatedUser teacher, String classLevelId, String subjectId) {
        TeacherAssignment assignment = academicAssignmentService.requireTeacherAssignment(teacher, classLevelId, subjectId);
        return homeworkRepository.findBySchoolIdAndClassLevelIdAndSubjectIdOrderByDueDateAscCreatedAtAsc(
                        assignment.getSchool().getId(),
                        classLevelId,
                        subjectId
                )
                .stream()
                .map(this::toResponseWithAllSubmissions)
                .toList();
    }

    @Transactional(readOnly = true)
    public HomeworkResponse teacherHomework(AuthenticatedUser teacher, String homeworkId) {
        Homework homework = requireHomework(homeworkId);
        academicAssignmentService.requireTeacherAssignment(
                teacher,
                homework.getClassLevel().getId(),
                homework.getSubject().getId()
        );
        return toResponseWithAllSubmissions(homework);
    }

    @Transactional(readOnly = true)
    public List<HomeworkResponse> parentChildHomework(AuthenticatedUser actor, String studentId) {
        Student student = requireParentLinkedToStudent(actor, studentId);
        return visibleHomework(student)
                .stream()
                .map(homework -> toResponse(homework, List.of()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HomeworkResponse> studentHomework(AuthenticatedUser actor) {
        Student student = requireStudentProfile(actor);
        return visibleHomework(student)
                .stream()
                .map(homework -> toResponse(homework, ownSubmission(homework, student)))
                .toList();
    }

    @Transactional
    public HomeworkResponse submitStudentHomework(
            AuthenticatedUser actor,
            String homeworkId,
            HomeworkSubmissionRequest request
    ) {
        Student student = requireStudentProfile(actor);
        Homework homework = requireHomework(homeworkId);
        requireHomeworkVisibleToStudent(homework, student);
        homeworkSubmissionRepository.findByHomeworkIdAndStudentId(homework.getId(), student.getId())
                .ifPresent(existing -> {
                    throw new ConflictException("Homework submission already exists for this student.");
                });
        HomeworkSubmission submission = homeworkSubmissionRepository.save(new HomeworkSubmission(
                homework,
                student,
                actor.user(),
                request.content().trim()
        ));
        recordHomeworkSubmitted(actor.user(), submission);
        return toResponse(homework, List.of(submission));
    }

    private HomeworkResponse createHomework(
            UserAccount actor,
            ClassLevel classLevel,
            Section section,
            ClassSubjectAssignment classSubject,
            HomeworkRequest request
    ) {
        Homework homework = homeworkRepository.save(new Homework(
                classLevel,
                section,
                classSubject.getSubject(),
                actor,
                request.title().trim(),
                request.instructions().trim(),
                request.dueDate()
        ));
        recordHomeworkPublished(actor, homework);
        return toResponse(homework, List.of());
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
        Student student = studentRepository.findByUserId(actor.user().getId())
                .filter(candidate -> candidate.getTenant().getId().equals(actor.user().getTenant().getId()))
                .orElseThrow(() -> new ForbiddenException("Student profile is not linked to this user."));
        requireActiveStudentSchool(actor, student);
        return student;
    }

    private void requireActiveStudentSchool(AuthenticatedUser actor, Student student) {
        if (actor.activeSchoolId() == null || actor.activeSchoolId().isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        if (!student.getSchool().getId().equals(actor.activeSchoolId())) {
            throw new ForbiddenException("Student profile is not linked to the active school.");
        }
    }

    private List<Homework> visibleHomework(Student student) {
        if (!student.isActive() || student.getClassLevel() == null) {
            return List.of();
        }
        return homeworkRepository.findVisibleForStudent(
                student.getSchool().getId(),
                student.getClassLevel().getId(),
                student.getSection() == null ? null : student.getSection().getId()
        );
    }

    private void requireHomeworkVisibleToStudent(Homework homework, Student student) {
        if (!student.isActive()
                || student.getClassLevel() == null
                || !homework.getSchool().getId().equals(student.getSchool().getId())
                || !homework.getClassLevel().getId().equals(student.getClassLevel().getId())) {
            throw new ForbiddenException("Homework is not assigned to this student.");
        }
        if (homework.getSection() != null
                && (student.getSection() == null || !homework.getSection().getId().equals(student.getSection().getId()))) {
            throw new ForbiddenException("Homework is not assigned to this student.");
        }
    }

    private Homework requireHomework(String homeworkId) {
        return homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new NotFoundException("Homework was not found."));
    }

    private HomeworkResponse toResponseWithAllSubmissions(Homework homework) {
        return toResponse(homework, homeworkSubmissionRepository.findByHomeworkIdOrderBySubmittedAtAsc(homework.getId()));
    }

    private List<HomeworkSubmission> ownSubmission(Homework homework, Student student) {
        return homeworkSubmissionRepository.findByHomeworkIdAndStudentId(homework.getId(), student.getId())
                .map(List::of)
                .orElseGet(List::of);
    }

    private HomeworkResponse toResponse(Homework homework, List<HomeworkSubmission> submissions) {
        Section section = homework.getSection();
        return new HomeworkResponse(
                homework.getId(),
                homework.getTenant().getId(),
                homework.getSchool().getId(),
                homework.getClassLevel().getId(),
                homework.getClassLevel().getName(),
                section == null ? null : section.getId(),
                section == null ? null : section.getName(),
                homework.getSubject().getId(),
                homework.getSubject().getCode(),
                homework.getSubject().getName(),
                homework.getTitle(),
                homework.getInstructions(),
                homework.getDueDate(),
                homework.getStatus(),
                homework.getCreatedByUser().getId(),
                homework.getCreatedByRole(),
                homework.getCreatedAt(),
                homework.getPublishedAt(),
                submissions.stream().map(this::toSubmissionResponse).toList()
        );
    }

    private HomeworkSubmissionResponse toSubmissionResponse(HomeworkSubmission submission) {
        return new HomeworkSubmissionResponse(
                submission.getId(),
                submission.getStudent().getId(),
                submission.getStudent().getFullName(),
                submission.getSubmittedByUser().getId(),
                submission.getContent(),
                submission.getSubmittedAt()
        );
    }

    private void recordHomeworkPublished(UserAccount actor, Homework homework) {
        auditLogService.record(
                homework.getTenant().getId(),
                homework.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.HOMEWORK_PUBLISHED,
                "Homework",
                homework.getId(),
                "Homework published.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", homework.getTenant().getId(),
                        "schoolId", homework.getSchool().getId(),
                        "homeworkId", homework.getId(),
                        "classLevelId", homework.getClassLevel().getId(),
                        "sectionId", homework.getSection() == null ? "" : homework.getSection().getId(),
                        "subjectId", homework.getSubject().getId()
                )
        );
    }

    private void recordHomeworkSubmitted(UserAccount actor, HomeworkSubmission submission) {
        auditLogService.record(
                submission.getTenant().getId(),
                submission.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.HOMEWORK_SUBMITTED,
                "HomeworkSubmission",
                submission.getId(),
                "Homework submitted.",
                Map.of(
                        "actorRole", actor.getRole().name(),
                        "tenantId", submission.getTenant().getId(),
                        "schoolId", submission.getSchool().getId(),
                        "homeworkId", submission.getHomework().getId(),
                        "submissionId", submission.getId(),
                        "studentId", submission.getStudent().getId()
                )
        );
    }
}
