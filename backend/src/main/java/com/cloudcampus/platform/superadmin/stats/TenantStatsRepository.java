package com.cloudcampus.platform.superadmin.stats;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantStatsRepository extends JpaRepository<TenantStats, String> {

    List<TenantStats> findByTenantIdIn(Collection<String> tenantIds);
}
