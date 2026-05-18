package com.cloudcampus.school.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.ConflictException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.school.dto.SchoolAccessResponse;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.entity.UserSchoolAccess;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.school.repository.UserSchoolAccessRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserSchoolAccessServiceImpl implements UserSchoolAccessService {

    private final UserSchoolAccessRepository accessRepo;
    private final SchoolRepository           schoolRepo;

    public UserSchoolAccessServiceImpl(UserSchoolAccessRepository accessRepo,
                                       SchoolRepository schoolRepo) {
        this.accessRepo = accessRepo;
        this.schoolRepo = schoolRepo;
    }

    @Override
    @Transactional
    public void grant(UUID userId, UUID schoolId, UUID tenantId,
                      UUID grantedByUserId, boolean isPrimary) {
        // Validate school exists; derive tenantId from school when caller is super-admin (null).
        Optional<School> maybeSchool = tenantId != null
                ? schoolRepo.findByIdFiltered(schoolId)
                : schoolRepo.findById(schoolId);
        School school = maybeSchool
                .orElseThrow(() -> new NotFoundException("School not found"));
        UUID resolvedTenantId = (tenantId != null) ? tenantId : school.getTenantId();
        if (tenantId != null && !school.getTenantId().equals(tenantId)) {
            throw new BadRequestException("School does not belong to this tenant");
        }

        if (accessRepo.existsByUserIdAndSchoolId(userId, schoolId)) {
            throw new ConflictException("User already has access to this school");
        }

        // If granting primary, demote all others first.
        if (isPrimary) {
            accessRepo.clearPrimaryForUser(userId);
        }

        accessRepo.save(UserSchoolAccess.create(userId, schoolId, resolvedTenantId, grantedByUserId, isPrimary));
    }

    @Override
    @Transactional
    public void revoke(UUID userId, UUID schoolId) {
        UserSchoolAccess access = accessRepo.findByUserIdAndSchoolId(userId, schoolId)
                .orElseThrow(() -> new NotFoundException("Access grant not found"));
        boolean wasPrimary = access.isPrimary();
        accessRepo.delete(access);

        // Promote the oldest remaining grant to primary to keep invariant intact.
        if (wasPrimary) {
            List<UserSchoolAccess> remaining =
                    accessRepo.findByUserIdOrderByPrimaryDescGrantedAtAsc(userId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setPrimary(true);
                accessRepo.save(remaining.get(0));
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SchoolAccessResponse> listForUser(UUID userId) {
        List<UserSchoolAccess> grants = accessRepo.findByUserIdOrderByPrimaryDescGrantedAtAsc(userId);
        if (grants.isEmpty()) return List.of();

        List<UUID> schoolIds = grants.stream().map(UserSchoolAccess::getSchoolId).toList();
        Map<UUID, School> schoolMap = schoolRepo.findAllById(schoolIds)
                .stream().collect(Collectors.toMap(School::getId, s -> s));

        return grants.stream().map(g -> {
            School s = schoolMap.get(g.getSchoolId());
            String name = s != null ? s.getName() : "Unknown";
            String code = s != null ? s.getCode() : "";
            return new SchoolAccessResponse(g.getSchoolId(), name, code, g.isPrimary());
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasAccess(UUID userId, UUID schoolId) {
        return accessRepo.existsByUserIdAndSchoolId(userId, schoolId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UUID> getPrimarySchoolId(UUID userId) {
        return accessRepo.findByUserIdAndPrimaryTrue(userId)
                .map(UserSchoolAccess::getSchoolId)
                .or(() -> accessRepo.findByUserIdOrderByPrimaryDescGrantedAtAsc(userId)
                        .stream().findFirst().map(UserSchoolAccess::getSchoolId));
    }
}
