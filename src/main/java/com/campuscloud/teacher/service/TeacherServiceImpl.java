package com.campuscloud.teacher.service;

import com.campuscloud.teacher.dto.TeacherCreateRequest;
import com.campuscloud.teacher.dto.TeacherResponse;
import com.campuscloud.teacher.entity.Teacher;
import com.campuscloud.teacher.repository.TeacherRepository;
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
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;

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
        teacher.setActive(true);

        Teacher saved = teacherRepository.save(teacher);
        log.info("Teacher created: employeeNo={}, tenant={}", saved.getEmployeeNo(), TenantContext.getTenant());
        return map(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TeacherResponse getTeacherById(UUID id) {
        validateTenantContext();
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found: " + id));
        return map(teacher);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TeacherResponse> getTeachers(Pageable pageable) {
        validateTenantContext();
        return teacherRepository.findAll(pageable).map(this::map);
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-ID header is required for teacher operations");
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
