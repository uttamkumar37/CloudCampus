package com.cloudcampus.school;

import java.util.List;
import java.util.Collection;

import com.cloudcampus.platform.superadmin.control.TenantAggregateCount;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SchoolRepository extends JpaRepository<School, String>, JpaSpecificationExecutor<School> {

    boolean existsByTenantIdAndCode(String tenantId, String code);

    long countByTenantId(String tenantId);

    long countByActiveTrue();

    long countByTenantIdAndActiveTrue(String tenantId);

    List<School> findByTenantIdOrderByNameAsc(String tenantId);

    List<School> findAllByOrderByCreatedAtDesc();

    @Query("""
            select new com.cloudcampus.platform.superadmin.control.TenantAggregateCount(
                school.tenant.id,
                count(school),
                coalesce(sum(case when school.active = true then 1 else 0 end), 0)
            )
            from School school
            where school.tenant.id in :tenantIds
            group by school.tenant.id
            """)
    List<TenantAggregateCount> countByTenantIds(@Param("tenantIds") Collection<String> tenantIds);
}
