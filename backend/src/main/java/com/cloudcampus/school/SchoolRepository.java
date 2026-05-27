package com.cloudcampus.school;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolRepository extends JpaRepository<School, String> {

    boolean existsByTenantIdAndCode(String tenantId, String code);

    long countByTenantId(String tenantId);

    long countByActiveTrue();

    long countByTenantIdAndActiveTrue(String tenantId);

    List<School> findByTenantIdOrderByNameAsc(String tenantId);

    List<School> findAllByOrderByCreatedAtDesc();
}
