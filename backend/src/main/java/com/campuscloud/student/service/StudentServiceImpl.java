package com.campuscloud.student.service;

import com.campuscloud.student.dto.StudentCreateRequest;
import com.campuscloud.student.dto.StudentResponse;
import com.campuscloud.student.entity.Student;
import com.campuscloud.student.repository.StudentRepository;
import com.campuscloud.tenant.service.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + id));
        return map(student);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentResponse> getStudents(Pageable pageable) {
        validateTenantContext();
        return studentRepository.findAll(pageable).map(this::map);
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-ID header is required for student operations");
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
