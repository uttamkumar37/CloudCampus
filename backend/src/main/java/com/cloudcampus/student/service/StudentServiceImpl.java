package com.cloudcampus.student.service;

import com.cloudcampus.student.dto.StudentCreateRequest;
import com.cloudcampus.student.dto.StudentResponse;
import com.cloudcampus.student.dto.StudentUpdateRequest;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.service.TenantContext;
import com.cloudcampus.auth.security.CloudCampusUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

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
