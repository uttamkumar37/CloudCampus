package com.cloudcampus.platform.subscription;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantSchoolLimitRepository extends JpaRepository<TenantSchoolLimit, String> {
}
