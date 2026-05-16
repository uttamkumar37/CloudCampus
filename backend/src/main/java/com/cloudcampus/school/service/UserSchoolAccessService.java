package com.cloudcampus.school.service;

import com.cloudcampus.school.dto.SchoolAccessResponse;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSchoolAccessService {

    void grant(UUID userId, UUID schoolId, UUID tenantId, UUID grantedByUserId, boolean isPrimary);

    void revoke(UUID userId, UUID schoolId);

    List<SchoolAccessResponse> listForUser(UUID userId);

    boolean hasAccess(UUID userId, UUID schoolId);

    /** Returns the primary school UUID for the user, or empty if no grants exist. */
    Optional<UUID> getPrimarySchoolId(UUID userId);
}
