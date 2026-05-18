package com.cloudcampus.finance.repository;

import com.cloudcampus.finance.entity.FeeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FeeCategoryRepository extends JpaRepository<FeeCategory, UUID> {

    List<FeeCategory> findBySchoolId(UUID schoolId);

    Optional<FeeCategory> findByIdAndTenantId(UUID id, UUID tenantId);

    Optional<FeeCategory> findByIdAndSchoolIdAndTenantId(UUID id, UUID schoolId, UUID tenantId);

    List<FeeCategory> findByIdInAndTenantId(Collection<UUID> ids, UUID tenantId);

    @Query("SELECT c FROM FeeCategory c WHERE c.schoolId = :schoolId AND c.active = true")
    List<FeeCategory> findActiveBySchoolId(@Param("schoolId") UUID schoolId);

    boolean existsBySchoolIdAndName(UUID schoolId, String name);
}
