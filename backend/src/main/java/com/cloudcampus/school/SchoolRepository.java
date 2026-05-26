package com.cloudcampus.school;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolRepository extends JpaRepository<School, String> {

    boolean existsByTenantIdAndCode(String tenantId, String code);
}
