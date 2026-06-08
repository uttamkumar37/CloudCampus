package com.cloudcampus.people.staff;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

import com.cloudcampus.identity.auth.UserRole;
import com.cloudcampus.platform.superadmin.control.SchoolAggregateCount;
import com.cloudcampus.platform.superadmin.control.TenantAggregateCount;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffProfileRepository extends JpaRepository<StaffProfile, String> {

    Optional<StaffProfile> findBySchoolIdAndUserId(String schoolId, String userId);

    List<StaffProfile> findBySchoolIdOrderByFullNameAsc(String schoolId);

    List<StaffProfile> findBySchoolIdAndRoleOrderByFullNameAsc(String schoolId, UserRole role);

    boolean existsBySchoolIdAndEmployeeNumberIgnoreCase(String schoolId, String employeeNumber);

    long countByTenantId(String tenantId);

    long countBySchoolIdAndActiveTrue(String schoolId);

    long countByActiveTrue();

    long countByTenantIdAndActiveTrue(String tenantId);

    @Query("""
            select new com.cloudcampus.platform.superadmin.control.TenantAggregateCount(
                staff.tenant.id,
                count(staff),
                coalesce(sum(case when staff.active = true then 1 else 0 end), 0)
            )
            from StaffProfile staff
            where staff.tenant.id in :tenantIds
            group by staff.tenant.id
            """)
    List<TenantAggregateCount> countByTenantIds(@Param("tenantIds") Collection<String> tenantIds);

    @Query("""
            select new com.cloudcampus.platform.superadmin.control.SchoolAggregateCount(
                staff.school.id,
                count(staff),
                coalesce(sum(case when staff.active = true then 1 else 0 end), 0)
            )
            from StaffProfile staff
            where staff.school.id in :schoolIds
            group by staff.school.id
            """)
    List<SchoolAggregateCount> countBySchoolIds(@Param("schoolIds") Collection<String> schoolIds);
}
