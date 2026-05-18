package com.cloudcampus.staff.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.usage.UsageLimitEnforcer;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.tenant.entity.Tenant;
import com.cloudcampus.tenant.repository.TenantRepository;
import com.cloudcampus.staff.dto.CreateStaffRequest;
import com.cloudcampus.staff.dto.SchoolAdminMeResponse;
import com.cloudcampus.staff.dto.StaffResponse;
import com.cloudcampus.staff.dto.StaffSummaryResponse;
import com.cloudcampus.staff.dto.UpdateStaffRequest;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.entity.StaffStatus;
import com.cloudcampus.staff.entity.StaffType;
import com.cloudcampus.staff.repository.StaffRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
class StaffServiceImpl implements StaffService {

    private final StaffRepository    repo;
    private final UsageLimitEnforcer limitEnforcer;
    private final SchoolRepository   schoolRepo;
    private final TenantRepository   tenantRepo;

    StaffServiceImpl(StaffRepository repo, UsageLimitEnforcer limitEnforcer,
                     SchoolRepository schoolRepo, TenantRepository tenantRepo) {
        this.repo          = repo;
        this.limitEnforcer = limitEnforcer;
        this.schoolRepo    = schoolRepo;
        this.tenantRepo    = tenantRepo;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Write
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public StaffResponse create(UUID schoolId, CreateStaffRequest req) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());

        limitEnforcer.checkStaffLimit(tenantId, schoolId);

        String empNumber = resolveEmployeeNumber(schoolId, req.employeeNumber());

        Staff staff = Staff.create(tenantId, schoolId,
                empNumber, req.staffType(),
                req.firstName(), req.lastName(),
                req.joiningDate());

        staff.setDepartmentId(req.departmentId());
        staff.setDateOfBirth(req.dateOfBirth());
        staff.setGender(req.gender());
        staff.setPhone(req.phone());
        staff.setEmail(req.email());
        staff.setAddress(req.address());
        staff.setPhotoUrl(req.photoUrl());
        staff.setQualification(req.qualification());
        staff.setSpecialization(req.specialization());

        return StaffResponse.from(repo.save(staff));
    }

    @Override
    @Transactional
    public StaffResponse update(UUID id, UpdateStaffRequest req) {
        Staff staff = findOrThrow(id);

        staff.setFirstName(req.firstName());
        staff.setLastName(req.lastName());
        staff.setDepartmentId(req.departmentId());
        staff.setJoiningDate(req.joiningDate());
        staff.setDateOfBirth(req.dateOfBirth());
        staff.setGender(req.gender());
        staff.setPhone(req.phone());
        staff.setEmail(req.email());
        staff.setAddress(req.address());
        staff.setPhotoUrl(req.photoUrl());
        staff.setQualification(req.qualification());
        staff.setSpecialization(req.specialization());

        return StaffResponse.from(repo.save(staff));
    }

    @Override
    @Transactional
    public StaffResponse markOnLeave(UUID id) {
        return changeStatus(id, StaffStatus.ON_LEAVE, StaffStatus.ACTIVE);
    }

    @Override
    @Transactional
    public StaffResponse returnFromLeave(UUID id) {
        return changeStatus(id, StaffStatus.ACTIVE, StaffStatus.ON_LEAVE);
    }

    @Override
    @Transactional
    public StaffResponse resign(UUID id) {
        return changeStatus(id, StaffStatus.RESIGNED, StaffStatus.ACTIVE);
    }

    @Override
    @Transactional
    public StaffResponse terminate(UUID id) {
        Staff staff = findOrThrow(id);
        if (staff.getStatus() == StaffStatus.RESIGNED
                || staff.getStatus() == StaffStatus.TERMINATED) {
            throw new BadRequestException(
                    "Staff is already " + staff.getStatus() + " — cannot terminate");
        }
        staff.setStatus(StaffStatus.TERMINATED);
        return StaffResponse.from(repo.save(staff));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Read
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<StaffSummaryResponse> listBySchool(UUID schoolId) {
        return repo.findAllBySchoolIdOrderByLastNameAscFirstNameAsc(schoolId)
                   .stream().map(StaffSummaryResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffSummaryResponse> listBySchoolAndStatus(UUID schoolId, StaffStatus status) {
        return repo.findAllBySchoolIdAndStatusOrderByLastNameAscFirstNameAsc(schoolId, status)
                   .stream().map(StaffSummaryResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffSummaryResponse> listBySchoolAndType(UUID schoolId, StaffType staffType) {
        return repo.findAllBySchoolIdAndStaffTypeOrderByLastNameAscFirstNameAsc(schoolId, staffType)
                   .stream().map(StaffSummaryResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffSummaryResponse> listByDepartment(UUID departmentId) {
        return repo.findAllByDepartmentIdOrderByLastNameAscFirstNameAsc(departmentId)
                   .stream().map(StaffSummaryResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffSummaryResponse> search(UUID schoolId, String query) {
        if (query == null || query.isBlank()) {
            return listBySchool(schoolId);
        }
        return repo.searchByName(schoolId, query.trim())
                   .stream().map(StaffSummaryResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StaffResponse getById(UUID id) {
        return StaffResponse.from(findOrThrow(id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private Staff findOrThrow(UUID id) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return repo.findByIdAndTenantId(id, tenantId)
                   .orElseThrow(() -> new NotFoundException("Staff not found: " + id));
    }

    private StaffResponse changeStatus(UUID id, StaffStatus target, StaffStatus required) {
        Staff staff = findOrThrow(id);
        if (staff.getStatus() != required) {
            throw new BadRequestException(
                    "Cannot set status " + target + " — staff must be " + required);
        }
        staff.setStatus(target);
        return StaffResponse.from(repo.save(staff));
    }

    /**
     * Returns the provided employee number if non-blank, otherwise auto-generates
     * one using the pattern {@code EMP-{YEAR}-{seq}} (e.g. "EMP-2025-001").
     */
    private String resolveEmployeeNumber(UUID schoolId, String provided) {
        if (provided != null && !provided.isBlank()) {
            if (repo.existsBySchoolIdAndEmployeeNumber(schoolId, provided.trim())) {
                throw new BadRequestException(
                        "Employee number '" + provided + "' is already in use for this school");
            }
            return provided.trim();
        }
        String yearPrefix = "EMP-" + Year.now().getValue() + "-";
        long count = repo.countBySchoolIdAndEmployeeNumberPrefix(schoolId, yearPrefix);
        String candidate;
        long seq = count + 1;
        do {
            candidate = yearPrefix + String.format("%03d", seq);
            seq++;
        } while (repo.existsBySchoolIdAndEmployeeNumber(schoolId, candidate));
        return candidate;
    }

    @Override
    @Transactional(readOnly = true)
    public SchoolAdminMeResponse getMe() {
        UUID userId   = RequestContext.getUserId();
        UUID schoolId = UUID.fromString(RequestContext.getSchoolId());
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        Staff staff = repo.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Staff profile not found for current user"));
        School school = schoolRepo.findByIdFiltered(schoolId)
                .orElseThrow(() -> new NotFoundException("School not found"));
        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new NotFoundException("Tenant not found"));
        return SchoolAdminMeResponse.from(staff, school, tenant);
    }
}
