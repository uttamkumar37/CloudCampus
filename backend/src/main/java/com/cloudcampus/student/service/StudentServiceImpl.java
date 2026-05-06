package com.cloudcampus.student.service;

import com.cloudcampus.student.dto.StudentCreateRequest;
import com.cloudcampus.student.dto.StudentDetailResponse;
import com.cloudcampus.student.dto.StudentResponse;
import com.cloudcampus.student.dto.StudentUpdateRequest;
import com.cloudcampus.academic.entity.SchoolClass;
import com.cloudcampus.academic.entity.Section;
import com.cloudcampus.academic.entity.Subject;
import com.cloudcampus.academic.repository.SchoolClassRepository;
import com.cloudcampus.academic.repository.SectionRepository;
import com.cloudcampus.academic.repository.SubjectRepository;
import com.cloudcampus.attendance.entity.AttendanceRecord;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.repository.ExamRepository;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.fees.repository.FeeAssignmentRepository;
import com.cloudcampus.homework.entity.HomeworkAssignment;
import com.cloudcampus.homework.repository.HomeworkAssignmentRepository;
import com.cloudcampus.parent.entity.ParentStudent;
import com.cloudcampus.parent.repository.ParentStudentRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.user.entity.UserRole;
import com.cloudcampus.user.entity.UserAccount;
import com.cloudcampus.user.repository.UserAccountRepository;
import com.cloudcampus.user.service.UserAccountProvisioningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserAccountProvisioningService userAccountProvisioningService;
    private final FeeAssignmentRepository feeAssignmentRepository;
    private final ExamResultRepository examResultRepository;
    private final ExamRepository examRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final HomeworkAssignmentRepository homeworkAssignmentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final UserAccountRepository userAccountRepository;

    @Override
    @Transactional
    public StudentResponse createStudent(StudentCreateRequest request) {
        validateTenantContext();

        String admissionNo = request.admissionNo().trim().toUpperCase(Locale.ROOT);
        if (studentRepository.existsByAdmissionNo(admissionNo)) {
            throw new IllegalArgumentException("Admission number already exists: " + admissionNo);
        }

        Student student = new Student();
        student.setAdmissionNo(admissionNo);
        student.setFirstName(request.firstName().trim());
        student.setLastName(request.lastName().trim());
        student.setDateOfBirth(request.dateOfBirth());
        student.setGender(request.gender());
        student.setEmail(normalizeNullable(request.email()));
        student.setPhone(normalizeNullable(request.phone()));
        student.setLinkedUser(userAccountProvisioningService.createDefaultUserAccount(
            request.firstName() + " " + request.lastName(),
            request.firstName(),
            request.phone(),
            request.email(),
            UserRole.STUDENT
        ));
        student.setActive(true);

        Student saved = studentRepository.save(student);
        log.info("Student created: admissionNo={}, tenant={}", saved.getAdmissionNo(), TenantContext.getTenant());
        return map(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getStudentById(UUID id) {
        validateTenantContext();
        Student student = studentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + id));
        return map(student);
    }

        @Override
        @Transactional(readOnly = true)
        public StudentDetailResponse getStudentDetails(UUID id) {
        validateTenantContext();
        Student student = studentRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Student not found: " + id));

        List<ParentStudent> parentLinks = parentStudentRepository.findByStudentId(student.getId());
        List<UserAccount> parentUsers = userAccountRepository.findAllById(
                parentLinks.stream().map(ParentStudent::getParentUserId).distinct().toList()
        );
        Map<UUID, String> parentNames = new HashMap<>();
        Map<UUID, String> parentEmails = new HashMap<>();
        Map<UUID, String> parentPhones = new HashMap<>();
        for (UserAccount parentUser : parentUsers) {
            parentNames.put(parentUser.getId(), parentUser.getFullName());
            parentEmails.put(parentUser.getId(), parentUser.getEmail());
            parentPhones.put(parentUser.getId(), parentUser.getPhone());
        }

        List<StudentDetailResponse.ParentContact> parents = parentLinks.stream()
            .map(link -> new StudentDetailResponse.ParentContact(
                link.getParentUserId(),
                parentNames.get(link.getParentUserId()),
                parentEmails.get(link.getParentUserId()),
                parentPhones.get(link.getParentUserId())
            ))
            .toList();

        List<StudentDetailResponse.FeeItem> fees = feeAssignmentRepository.findAllByStudentId(student.getId()).stream()
            .sorted(Comparator.comparing(f -> f.getDueDate(), Comparator.nullsLast(Comparator.reverseOrder())))
            .map(fee -> new StudentDetailResponse.FeeItem(
                fee.getId(),
                fee.getFeeTitle(),
                fee.getAmount(),
                fee.getDueDate(),
                fee.getStatus().name()
            ))
            .toList();

        List<ExamResult> results = examResultRepository.findTop20ByStudentIdOrderByCreatedAtDesc(student.getId());
        Map<UUID, Exam> examsById = examRepository.findAllById(results.stream().map(ExamResult::getExamId).toList())
            .stream()
            .collect(java.util.stream.Collectors.toMap(Exam::getId, exam -> exam));
        Map<UUID, Subject> subjectsById = subjectRepository.findAllById(
                examsById.values().stream().map(Exam::getSubjectId).distinct().toList())
            .stream()
            .collect(java.util.stream.Collectors.toMap(Subject::getId, subject -> subject));

        List<StudentDetailResponse.ExamItem> exams = results.stream()
            .map(result -> {
                Exam exam = examsById.get(result.getExamId());
                Subject subject = exam == null ? null : subjectsById.get(exam.getSubjectId());
                return new StudentDetailResponse.ExamItem(
                    result.getId(),
                    exam == null ? null : exam.getTitle(),
                    exam == null ? null : exam.getExamDate(),
                    subject == null ? null : subject.getName(),
                    result.getMarksObtained(),
                    result.getGrade(),
                    result.isPublished()
                );
            })
            .toList();

        List<AttendanceRecord> attendanceRecords = attendanceRecordRepository.findTop20ByStudentIdOrderByAttendanceDateDesc(student.getId());
        Map<UUID, SchoolClass> classesById = schoolClassRepository.findAllById(
                attendanceRecords.stream().map(AttendanceRecord::getClassId).distinct().toList())
            .stream()
            .collect(java.util.stream.Collectors.toMap(SchoolClass::getId, schoolClass -> schoolClass));
        Map<UUID, Section> sectionsById = sectionRepository.findAllById(
                attendanceRecords.stream().map(AttendanceRecord::getSectionId).distinct().toList())
            .stream()
            .collect(java.util.stream.Collectors.toMap(Section::getId, section -> section));

        List<StudentDetailResponse.AttendanceItem> attendance = attendanceRecords.stream()
            .map(record -> {
                SchoolClass schoolClass = classesById.get(record.getClassId());
                Section section = sectionsById.get(record.getSectionId());
                return new StudentDetailResponse.AttendanceItem(
                    record.getAttendanceDate(),
                    record.getStatus().name(),
                    schoolClass == null ? null : schoolClass.getName(),
                    section == null ? null : section.getName(),
                    record.getRemarks()
                );
            })
            .toList();

        List<StudentDetailResponse.HomeworkItem> homework = List.of();
        if (!attendanceRecords.isEmpty()) {
            AttendanceRecord latestAttendance = attendanceRecords.get(0);
            List<HomeworkAssignment> assignments = homeworkAssignmentRepository
                .findTop10ByClassIdAndSectionIdOrderByCreatedAtDesc(
                    latestAttendance.getClassId(),
                    latestAttendance.getSectionId()
                );
            homework = assignments.stream()
                .map(assignment -> {
                SchoolClass schoolClass = classesById.get(assignment.getClassId());
                Section section = sectionsById.get(assignment.getSectionId());
                return new StudentDetailResponse.HomeworkItem(
                    assignment.getId(),
                    assignment.getTitle(),
                    assignment.getDueDate(),
                    schoolClass == null ? null : schoolClass.getName(),
                    section == null ? null : section.getName(),
                    assignment.getCreatedAt()
                );
                })
                .toList();
        }

        return new StudentDetailResponse(
            map(student),
            parents,
            fees,
            exams,
            attendance,
            homework
        );
        }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getMyProfile() {
        validateTenantContext();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CloudCampusUserDetails campus)) {
            throw new IllegalStateException("Not authenticated");
        }
        return studentRepository.findByLinkedUser_Id(campus.getUserId())
                .map(this::map)
                .orElseThrow(() -> new IllegalStateException("No student profile linked to this account"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentResponse> getStudents(Pageable pageable) {
        validateTenantContext();
        return studentRepository.findAllByDeletedAtIsNull(pageable).map(this::map);
    }

    @Override
    @Transactional
    public StudentResponse updateStudent(UUID id, StudentUpdateRequest request) {
        validateTenantContext();
        Student student = studentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + id));
        if (request.firstName() != null && !request.firstName().isBlank()) {
            student.setFirstName(request.firstName().trim());
        }
        if (request.lastName() != null && !request.lastName().isBlank()) {
            student.setLastName(request.lastName().trim());
        }
        student.setEmail(normalizeNullable(request.email()));
        student.setPhone(normalizeNullable(request.phone()));
        Student saved = studentRepository.save(student);
        log.info("Student updated: id={}, tenant={}", id, TenantContext.getTenant());
        return map(saved);
    }

    @Override
    @Transactional
    public void softDeleteStudent(UUID id) {
        validateTenantContext();
        Student student = studentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + id));
        student.setDeletedAt(Instant.now());
        student.setActive(false);
        studentRepository.save(student);
        log.info("Student soft-deleted: id={}, tenant={}", id, TenantContext.getTenant());
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required for student operations");
        }
    }

    private StudentResponse map(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getAdmissionNo(),
                student.getFirstName(),
                student.getLastName(),
                student.getDateOfBirth(),
                student.getGender(),
                student.getEmail(),
                student.getPhone(),
                student.isActive(),
                student.getCreatedAt()
        );
    }
}
