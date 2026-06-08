package com.cloudcampus.audit;

import java.util.List;
import java.util.Collection;

import com.cloudcampus.platform.superadmin.control.SchoolActivityAggregate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, String>, JpaSpecificationExecutor<AuditLog> {

    List<AuditLog> findByTenantId(String tenantId);

    List<AuditLog> findAllByOrderByCreatedAtDesc();

    List<AuditLog> findTop10ByOrderByCreatedAtDesc();

    @Query("""
            select new com.cloudcampus.platform.superadmin.control.SchoolActivityAggregate(
                audit.schoolId,
                max(audit.createdAt)
            )
            from AuditLog audit
            where audit.schoolId in :schoolIds
            group by audit.schoolId
            """)
    List<SchoolActivityAggregate> latestActivityBySchoolIds(@Param("schoolIds") Collection<String> schoolIds);
}
