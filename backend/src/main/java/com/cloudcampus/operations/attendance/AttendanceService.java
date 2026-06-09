package com.cloudcampus.operations.attendance;

import java.time.LocalDate;
import java.util.AbstractMap.SimpleEntry;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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
public class AttendanceService {

    private final AttendanceSessionRepository attendanceSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ClassLevelRepository classLevelRepository;
    private final SectionRepository sectionRepository;
    private final ClassSubjectAssignmentRepository classSubjectAssignmentRepository;
    private final StudentRepository studentRepository;
    private final ParentStudentLinkRepository parentStudentLinkRepository;
    private final SchoolRepository schoolRepository;
    private final SchoolAccessService schoolAccessService;
    private final AcademicAssignmentService academicAssignmentService;
    private final AuditLogService auditLogService;

    public AttendanceService(
            AttendanceSessionRepository attendanceSessionRepository,
            AttendanceRecordRepository attendanceRecordRepository,
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
        this.attendanceSessionRepository = attendanceSessionRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
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
    public AttendanceSessionResponse createSchoolAdminSession(AuthenticatedUser actor, AttendanceSessionRequest request) {
        School activeSchool = requireActiveSchoolAdminSchool(actor);
        ClassLevel classLevel = requireClassLevelSchoolAdminAccess(actor, request.classLevelId());
        if (!classLevel.getSchool().getId().equals(activeSchool.getId())) {
            throw new ForbiddenException("Class does not belong to the active school.");
        }
        ClassSubjectAssignment classSubject = requireClassSubject(classLevel, request.subjectId());
        Section section = requireSectionForClass(classLevel, request.sectionId());
        return createSession(actor.user(), classLevel, section, classSubject, request);
    }

    @Transactional(readOnly = true)
    public List<AttendanceSessionResponse> schoolAdminSessions(AuthenticatedUser actor) {
        School school = requireActiveSchoolLeadershipSchool(actor);
        return attendanceSessionRepository.findBySchoolIdOrderByAttendanceDateDescCreatedAtDesc(school.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AttendanceSessionResponse schoolAdminSession(AuthenticatedUser actor, String sessionId) {
        AttendanceSession session = requireSession(sessionId);
        schoolAccessService.requireSchoolLeadershipAccess(actor.user().getId(), session.getSchool().getId());
        return toResponse(session);
    }

    @Transactional
    public AttendanceSessionResponse createTeacherSession(AuthenticatedUser actor, AttendanceSessionRequest request) {
        TeacherAssignment assignment = academicAssignmentService.requireTeacherAssignment(
                actor,
                request.classLevelId(),
                request.subjectId()
        );
        ClassLevel classLevel = assignment.getClassSubjectAssignment().getClassLevel();
        Section section = requireSectionForClass(classLevel, request.sectionId());
        return createSession(actor.user(), classLevel, section, assignment.getClassSubjectAssignment(), request);
    }

    @Transactional(readOnly = true)
    public List<AttendanceSessionResponse> teacherSessions(
            AuthenticatedUser teacher,
            String classLevelId,
            String subjectId
    ) {
        TeacherAssignment assignment = academicAssignmentService.requireTeacherAssignment(teacher, classLevelId, subjectId);
        return attendanceSessionRepository.findBySchoolIdAndClassLevelIdAndSubjectIdOrderByAttendanceDateDescCreatedAtDesc(
                        assignment.getSchool().getId(),
                        classLevelId,
                        subjectId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AttendanceSessionResponse teacherSession(AuthenticatedUser teacher, String sessionId) {
        AttendanceSession session = requireSession(sessionId);
        academicAssignmentService.requireTeacherAssignment(
                teacher,
                session.getClassLevel().getId(),
                session.getSubject().getId()
        );
        return toResponse(session);
    }

    @Transactional(readOnly = true)
    public List<StudentAttendanceResponse> parentChildAttendance(AuthenticatedUser parent, String studentId) {
        Student student = requireParentLinkedStudent(parent, studentId);
        return attendanceRecordRepository.findByStudentIdOrderBySessionAttendanceDateDesc(student.getId())
                .stream()
                .map(this::toStudentAttendanceResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentAttendanceResponse> studentAttendance(AuthenticatedUser actor) {
        Student student = requireStudentProfile(actor);
        return attendanceRecordRepository.findByStudentIdOrderBySessionAttendanceDateDesc(student.getId())
                .stream()
                .map(this::toStudentAttendanceResponse)
                .toList();
    }

    private AttendanceSessionResponse createSession(
            UserAccount actor,
            ClassLevel classLevel,
            Section section,
            ClassSubjectAssignment classSubject,
            AttendanceSessionRequest request
    ) {
        rejectDuplicateSession(classLevel, section, classSubject, request.attendanceDate());
        Map<String, Student> studentsById = requireStudents(classLevel, section, request.records());

        AttendanceSession session = attendanceSessionRepository.save(new AttendanceSession(
                classLevel,
                section,
                classSubject.getSubject(),
                actor,
                request.attendanceDate()
        ));
        List<AttendanceRecord> records = request.records()
                .stream()
                .map(record -> new AttendanceRecord(
                        session,
                        studentsById.get(record.studentId()),
                        record.status(),
                        normalizeOptional(record.remark())
                ))
                .toList();
        attendanceRecordRepository.saveAll(records);
        recordAttendanceSubmitted(actor, session, records);
        return toResponse(session);
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

    private School requireActiveSchoolLeadershipSchool(AuthenticatedUser actor) {
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required.");
        }
        schoolAccessService.requireSchoolLeadershipAccess(actor.user().getId(), activeSchoolId);
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

    private Map<String, Student> requireStudents(
            ClassLevel classLevel,
            Section section,
            List<AttendanceRecordRequest> requestedRecords
    ) {
        Map<String, AttendanceRecordRequest> uniqueRecords = new LinkedHashMap<>();
        for (AttendanceRecordRequest record : requestedRecords) {
            if (uniqueRecords.putIfAbsent(record.studentId(), record) != null) {
                throw new BadRequestException("Attendance contains duplicate student records.");
            }
        }

        Map<String, Student> studentsById = studentRepository.findAllById(uniqueRecords.keySet())
                .stream()
                .collect(Collectors.toMap(Student::getId, Function.identity()));
        for (String studentId : uniqueRecords.keySet()) {
            Student student = studentsById.get(studentId);
            if (student == null) {
                throw new NotFoundException("Student was not found.");
            }
            requireStudentInAttendanceScope(student, classLevel, section);
        }
        return studentsById;
    }

    private void requireStudentInAttendanceScope(Student student, ClassLevel classLevel, Section section) {
        if (!student.isActive() || !student.getSchool().getId().equals(classLevel.getSchool().getId())) {
            throw new ForbiddenException("Student does not belong to this school.");
        }
        if (student.getClassLevel() == null || !student.getClassLevel().getId().equals(classLevel.getId())) {
            throw new ForbiddenException("Student does not belong to this class.");
        }
        if (section != null) {
            if (student.getSection() == null || !student.getSection().getId().equals(section.getId())) {
                throw new ForbiddenException("Student does not belong to this section.");
            }
        }
    }

    private void rejectDuplicateSession(
            ClassLevel classLevel,
            Section section,
            ClassSubjectAssignment classSubject,
            LocalDate attendanceDate
    ) {
        var existing = section == null
                ? attendanceSessionRepository.findBySchoolIdAndClassLevelIdAndSectionIsNullAndSubjectIdAndAttendanceDate(
                        classLevel.getSchool().getId(),
                        classLevel.getId(),
                        classSubject.getSubject().getId(),
                        attendanceDate
                )
                : attendanceSessionRepository.findBySchoolIdAndClassLevelIdAndSectionIdAndSubjectIdAndAttendanceDate(
                        classLevel.getSchool().getId(),
                        classLevel.getId(),
                        section.getId(),
                        classSubject.getSubject().getId(),
                        attendanceDate
                );
        existing.ifPresent(session -> {
            throw new ConflictException("Attendance is already submitted for this class subject and date.");
        });
    }

    private AttendanceSession requireSession(String sessionId) {
        return attendanceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Attendance session was not found."));
    }

    private AttendanceSessionResponse toResponse(AttendanceSession session) {
        List<AttendanceRecordResponse> records = attendanceRecordRepository.findBySessionIdOrderByStudentAdmissionNumberAsc(
                        session.getId()
                )
                .stream()
                .map(this::toRecordResponse)
                .toList();
        return new AttendanceSessionResponse(
                session.getId(),
                session.getTenant().getId(),
                session.getSchool().getId(),
                session.getClassLevel().getId(),
                session.getClassLevel().getName(),
                session.getSection() == null ? null : session.getSection().getId(),
                session.getSection() == null ? null : session.getSection().getName(),
                session.getSubject().getId(),
                session.getSubject().getCode(),
                session.getSubject().getName(),
                session.getSubmittedBy().getId(),
                session.getSubmittedByRole(),
                session.getAttendanceDate(),
                count(records, AttendanceStatus.PRESENT),
                count(records, AttendanceStatus.ABSENT),
                count(records, AttendanceStatus.LATE),
                count(records, AttendanceStatus.EXCUSED),
                session.getCreatedAt(),
                records
        );
    }

    private AttendanceRecordResponse toRecordResponse(AttendanceRecord record) {
        Student student = record.getStudent();
        return new AttendanceRecordResponse(
                record.getId(),
                student.getId(),
                student.getAdmissionNumber(),
                student.getFullName(),
                record.getStatus(),
                record.getRemark()
        );
    }

    private StudentAttendanceResponse toStudentAttendanceResponse(AttendanceRecord record) {
        AttendanceSession session = record.getSession();
        Student student = record.getStudent();
        return new StudentAttendanceResponse(
                record.getId(),
                record.getTenant().getId(),
                record.getSchool().getId(),
                session.getId(),
                student.getId(),
                student.getFullName(),
                student.getAdmissionNumber(),
                session.getClassLevel().getId(),
                session.getClassLevel().getName(),
                session.getSection() == null ? null : session.getSection().getId(),
                session.getSection() == null ? null : session.getSection().getName(),
                session.getSubject().getId(),
                session.getSubject().getCode(),
                session.getSubject().getName(),
                session.getAttendanceDate(),
                record.getStatus(),
                record.getRemark(),
                session.getCreatedAt()
        );
    }

    private Student requireParentLinkedStudent(AuthenticatedUser actor, String studentId) {
        if (actor.user().getRole() != UserRole.PARENT) {
            throw new ForbiddenException("Parent access is required.");
        }
        String activeSchoolId = actor.activeSchoolId();
        if (activeSchoolId == null || activeSchoolId.isBlank()) {
            throw new ForbiddenException("An active school is required for parent access.");
        }
        return parentStudentLinkRepository.findByParentUserIdAndStudentId(actor.user().getId(), studentId)
                .filter(link -> link.getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getStudent().getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getSchool().getTenant().getId().equals(actor.user().getTenant().getId()))
                .filter(link -> link.getSchool().getId().equals(activeSchoolId))
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

    private long count(List<AttendanceRecordResponse> records, AttendanceStatus status) {
        return records.stream().filter(record -> record.status() == status).count();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void recordAttendanceSubmitted(
            UserAccount actor,
            AttendanceSession session,
            List<AttendanceRecord> records
    ) {
        auditLogService.record(
                session.getTenant().getId(),
                session.getSchool().getId(),
                actor.getRole().name(),
                actor.getId(),
                AuditAction.ATTENDANCE_SUBMITTED,
                "AttendanceSession",
                session.getId(),
                "Attendance submitted.",
                Map.ofEntries(
                        new SimpleEntry<>("actorRole", actor.getRole().name()),
                        new SimpleEntry<>("tenantId", session.getTenant().getId()),
                        new SimpleEntry<>("schoolId", session.getSchool().getId()),
                        new SimpleEntry<>("sessionId", session.getId()),
                        new SimpleEntry<>("classLevelId", session.getClassLevel().getId()),
                        new SimpleEntry<>("sectionId", session.getSection() == null ? "" : session.getSection().getId()),
                        new SimpleEntry<>("subjectId", session.getSubject().getId()),
                        new SimpleEntry<>("attendanceDate", session.getAttendanceDate().toString()),
                        new SimpleEntry<>("recordCount", records.size()),
                        new SimpleEntry<>(
                                "presentCount",
                                records.stream().filter(record -> record.getStatus() == AttendanceStatus.PRESENT).count()
                        ),
                        new SimpleEntry<>(
                                "absentCount",
                                records.stream().filter(record -> record.getStatus() == AttendanceStatus.ABSENT).count()
                        )
                )
        );
    }
}
