package com.cloudcampus.intelligence.ai;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AiPolicyRepository extends JpaRepository<AiPolicy, String>, JpaSpecificationExecutor<AiPolicy> {

    Optional<AiPolicy> findByTenantIdAndSchoolId(String tenantId, String schoolId);

    Optional<AiPolicy> findByTenantIdAndSchoolIsNull(String tenantId);
}
