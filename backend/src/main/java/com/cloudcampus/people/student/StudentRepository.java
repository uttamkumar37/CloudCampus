package com.cloudcampus.people.student;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

import com.cloudcampus.platform.superadmin.control.SchoolAggregateCount;
import com.cloudcampus.platform.superadmin.control.TenantAggregateCount;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, String> {

    boolean existsBySchoolIdAndAdmissionNumber(String schoolId, String admissionNumber);

    Optional<Student> findBySchoolIdAndAdmissionNumber(String schoolId, String admissionNumber);

    Optional<Student> findByUserId(String userId);

    Optional<Student> findBySchoolIdAndUserId(String schoolId, String userId);

    List<Student> findBySchoolIdOrderByAdmissionNumberAsc(String schoolId);

    List<Student> findBySchoolIdAndClassLevelIdAndActiveTrueOrderByAdmissionNumberAsc(String schoolId, String classLevelId);

    List<Student> findBySchoolIdAndClassLevelIdAndSectionIdAndActiveTrueOrderByAdmissionNumberAsc(
            String schoolId,
            String classLevelId,
            String sectionId
    );

    long countByTenantId(String tenantId);

    long countBySchoolIdAndActiveTrue(String schoolId);

    long countByActiveTrue();

    long countByTenantIdAndActiveTrue(String tenantId);

    @Query("""
            select new com.cloudcampus.platform.superadmin.control.TenantAggregateCount(
                student.tenant.id,
                count(student),
                coalesce(sum(case when student.active = true then 1 else 0 end), 0)
            )
            from Student student
            where student.tenant.id in :tenantIds
            group by student.tenant.id
            """)
    List<TenantAggregateCount> countByTenantIds(@Param("tenantIds") Collection<String> tenantIds);

    @Query("""
            select new com.cloudcampus.platform.superadmin.control.SchoolAggregateCount(
                student.school.id,
                count(student),
                coalesce(sum(case when student.active = true then 1 else 0 end), 0)
            )
            from Student student
            where student.school.id in :schoolIds
            group by student.school.id
            """)
    List<SchoolAggregateCount> countBySchoolIds(@Param("schoolIds") Collection<String> schoolIds);
}
