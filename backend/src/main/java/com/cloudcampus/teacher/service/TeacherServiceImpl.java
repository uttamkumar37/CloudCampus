package com.cloudcampus.teacher.service;

import com.cloudcampus.teacher.dto.TeacherCreateRequest;
import com.cloudcampus.teacher.dto.TeacherDetailResponse;
import com.cloudcampus.teacher.dto.TeacherResponse;
import com.cloudcampus.teacher.dto.TeacherUpdateRequest;
import com.cloudcampus.academic.entity.SchoolClass;
import com.cloudcampus.academic.entity.Section;
import com.cloudcampus.academic.entity.Subject;
import com.cloudcampus.academic.repository.SchoolClassRepository;
import com.cloudcampus.academic.repository.SectionRepository;
import com.cloudcampus.academic.repository.SubjectRepository;
import com.cloudcampus.homework.entity.HomeworkAssignment;
import com.cloudcampus.homework.repository.HomeworkAssignmentRepository;
import com.cloudcampus.teacher.entity.Teacher;
import com.cloudcampus.teacher.repository.TeacherRepository;
import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.user.entity.UserRole;
import com.cloudcampus.user.service.UserAccountProvisioningService;
import com.cloudcampus.timetable.entity.TimetableSlot;
import com.cloudcampus.timetable.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserAccountProvisioningService userAccountProvisioningService;
    private final TimetableSlotRepository timetableSlotRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final HomeworkAssignmentRepository homeworkAssignmentRepository;

    @Override
    @Transactional
    public TeacherResponse createTeacher(TeacherCreateRequest request) {
        validateTenantContext();

        String employeeNo = request.employeeNo().trim().toUpperCase(Locale.ROOT);
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (teacherRepository.existsByEmployeeNo(employeeNo)) {
            throw new IllegalArgumentException("Employee number already exists: " + employeeNo);
        }
        if (teacherRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }

        Teacher teacher = new Teacher();
        teacher.setEmployeeNo(employeeNo);
        teacher.setFirstName(request.firstName().trim());
        teacher.setLastName(request.lastName().trim());
        teacher.setEmail(email);
        teacher.setPhone(normalizeNullable(request.phone()));
        teacher.setHireDate(request.hireDate());
        teacher.setLinkedUser(userAccountProvisioningService.createDefaultUserAccount(
            request.firstName() + " " + request.lastName(),
            request.firstName(),
            request.phone(),
            request.email(),
            UserRole.TEACHER
        ));
        teacher.setActive(true);

        Teacher saved = teacherRepository.save(teacher);
        log.info("Teacher created: employeeNo={}, tenant={}", saved.getEmployeeNo(), TenantContext.getTenant());
        return map(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TeacherResponse getTeacherById(UUID id) {
        validateTenantContext();
        Teacher teacher = teacherRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found: " + id));
        return map(teacher);
    }

        @Override
        @Transactional(readOnly = true)
        public TeacherDetailResponse getTeacherDetails(UUID id) {
        validateTenantContext();
        Teacher teacher = teacherRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Teacher not found: " + id));

        List<TimetableSlot> slots = timetableSlotRepository.findByTeacherIdOrderByDayOfWeekAscStartTimeAsc(teacher.getId());
        Map<UUID, SchoolClass> classesById = schoolClassRepository.findAllById(
                slots.stream().map(TimetableSlot::getClassId).distinct().toList())
            .stream()
            .collect(java.util.stream.Collectors.toMap(SchoolClass::getId, schoolClass -> schoolClass));
        Map<UUID, Section> sectionsById = sectionRepository.findAllById(
                slots.stream().map(TimetableSlot::getSectionId).distinct().toList())
            .stream()
            .collect(java.util.stream.Collectors.toMap(Section::getId, section -> section));
        Map<UUID, Subject> subjectsById = subjectRepository.findAllById(
                slots.stream().map(TimetableSlot::getSubjectId).distinct().toList())
            .stream()
            .collect(java.util.stream.Collectors.toMap(Subject::getId, subject -> subject));

        List<TeacherDetailResponse.TimetableItem> timetable = slots.stream()
            .map(slot -> {
                SchoolClass schoolClass = classesById.get(slot.getClassId());
                Section section = sectionsById.get(slot.getSectionId());
                Subject subject = subjectsById.get(slot.getSubjectId());
                return new TeacherDetailResponse.TimetableItem(
                    slot.getId(),
                    slot.getDayOfWeek(),
                    slot.getStartTime(),
                    slot.getEndTime(),
                    schoolClass == null ? null : schoolClass.getName(),
                    section == null ? null : section.getName(),
                    subject == null ? null : subject.getName()
                );
            })
            .toList();

        Set<String> uniqueAssignments = new HashSet<>();
        for (TimetableSlot slot : slots) {
            uniqueAssignments.add(slot.getClassId() + "|" + slot.getSectionId());
        }

        List<TeacherDetailResponse.HomeworkItem> homework = List.of();
        if (teacher.getLinkedUser() != null) {
            homework = homeworkAssignmentRepository.findTop5ByAssignedByUserIdOrderByCreatedAtDesc(teacher.getLinkedUser().getId())
                .stream()
                .sorted(Comparator.comparing(HomeworkAssignment::getCreatedAt).reversed())
                .map(assignment -> {
                SchoolClass schoolClass = classesById.get(assignment.getClassId());
                Section section = sectionsById.get(assignment.getSectionId());
                if (schoolClass == null) {
                    schoolClass = schoolClassRepository.findById(assignment.getClassId()).orElse(null);
                }
                if (section == null && assignment.getSectionId() != null) {
                    section = sectionRepository.findById(assignment.getSectionId()).orElse(null);
                }
                return new TeacherDetailResponse.HomeworkItem(
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

        return new TeacherDetailResponse(
            map(teacher),
            uniqueAssignments.size(),
            timetable,
            homework
        );
        }

    @Override
    @Transactional(readOnly = true)
    public TeacherResponse getMyProfile() {
        validateTenantContext();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CloudCampusUserDetails campus)) {
            throw new IllegalStateException("Not authenticated");
        }
        return teacherRepository.findByLinkedUser_Id(campus.getUserId())
                .map(this::map)
                .orElseThrow(() -> new IllegalStateException("No teacher profile linked to this account"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TeacherResponse> getTeachers(Pageable pageable) {
        validateTenantContext();
        return teacherRepository.findAllByDeletedAtIsNull(pageable).map(this::map);
    }

    @Override
    @Transactional
    public TeacherResponse updateTeacher(UUID id, TeacherUpdateRequest request) {
        validateTenantContext();
        Teacher teacher = teacherRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found: " + id));
        if (request.firstName() != null && !request.firstName().isBlank()) {
            teacher.setFirstName(request.firstName().trim());
        }
        if (request.lastName() != null && !request.lastName().isBlank()) {
            teacher.setLastName(request.lastName().trim());
        }
        if (request.email() != null && !request.email().isBlank()) {
            String email = request.email().trim().toLowerCase(Locale.ROOT);
            // Only validate uniqueness if email is actually changing
            if (!email.equals(teacher.getEmail()) && teacherRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email already exists: " + email);
            }
            teacher.setEmail(email);
        }
        teacher.setPhone(normalizeNullable(request.phone()));
        Teacher saved = teacherRepository.save(teacher);
        log.info("Teacher updated: id={}, tenant={}", id, TenantContext.getTenant());
        return map(saved);
    }

    @Override
    @Transactional
    public void softDeleteTeacher(UUID id) {
        validateTenantContext();
        Teacher teacher = teacherRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found: " + id));
        teacher.setDeletedAt(Instant.now());
        teacher.setActive(false);
        teacherRepository.save(teacher);
        log.info("Teacher soft-deleted: id={}, tenant={}", id, TenantContext.getTenant());
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required for teacher operations");
        }
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private TeacherResponse map(Teacher teacher) {
        return new TeacherResponse(
                teacher.getId(),
                teacher.getEmployeeNo(),
                teacher.getFirstName(),
                teacher.getLastName(),
                teacher.getEmail(),
                teacher.getPhone(),
                teacher.getHireDate(),
                teacher.isActive(),
                teacher.getCreatedAt()
        );
    }
}
