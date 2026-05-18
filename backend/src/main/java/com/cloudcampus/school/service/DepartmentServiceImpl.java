package com.cloudcampus.school.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.dto.DepartmentRequest;
import com.cloudcampus.school.dto.DepartmentResponse;
import com.cloudcampus.school.entity.Department;
import com.cloudcampus.school.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository repo;

    DepartmentServiceImpl(DepartmentRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public DepartmentResponse create(UUID schoolId, DepartmentRequest req) {
        if (repo.existsBySchoolIdAndName(schoolId, req.name())) {
            throw new BadRequestException("Department '" + req.name() + "' already exists for this school");
        }
        if (req.code() != null && !req.code().isBlank()
                && repo.existsBySchoolIdAndCode(schoolId, req.code())) {
            throw new BadRequestException("Department code '" + req.code() + "' already exists for this school");
        }
        Department dept = Department.create(
                UUID.fromString(RequestContext.getTenantId()),
                schoolId, req.name(), req.code(), req.description()
        );
        return DepartmentResponse.from(repo.save(dept));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponse> listBySchool(UUID schoolId) {
        return repo.findAllBySchoolIdOrderByNameAsc(schoolId)
                   .stream().map(DepartmentResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponse> listActive(UUID schoolId) {
        return repo.findAllBySchoolIdAndIsActiveOrderByNameAsc(schoolId, true)
                   .stream().map(DepartmentResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponse getById(UUID id) {
        return DepartmentResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    public DepartmentResponse update(UUID id, DepartmentRequest req) {
        Department dept = findOrThrow(id);
        if (!dept.getName().equals(req.name())
                && repo.existsBySchoolIdAndName(dept.getSchoolId(), req.name())) {
            throw new BadRequestException("Department '" + req.name() + "' already exists for this school");
        }
        if (req.code() != null && !req.code().isBlank()
                && !req.code().equals(dept.getCode())
                && repo.existsBySchoolIdAndCode(dept.getSchoolId(), req.code())) {
            throw new BadRequestException("Department code '" + req.code() + "' already exists for this school");
        }
        dept.setName(req.name());
        dept.setCode(req.code());
        dept.setDescription(req.description());
        return DepartmentResponse.from(repo.save(dept));
    }

    @Override
    @Transactional
    public DepartmentResponse deactivate(UUID id) {
        Department dept = findOrThrow(id);
        if (!dept.isActive()) {
            throw new BadRequestException("Department is already inactive");
        }
        dept.setActive(false);
        return DepartmentResponse.from(repo.save(dept));
    }

    @Override
    @Transactional
    public DepartmentResponse activate(UUID id) {
        Department dept = findOrThrow(id);
        if (dept.isActive()) {
            throw new BadRequestException("Department is already active");
        }
        dept.setActive(true);
        return DepartmentResponse.from(repo.save(dept));
    }

    private Department findOrThrow(UUID id) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return repo.findByIdAndTenantId(id, tenantId)
                   .orElseThrow(() -> new NotFoundException("Department not found: " + id));
    }
}
