package com.cloudcampus.school.repository;

import com.cloudcampus.school.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClassRoomRepository extends JpaRepository<ClassRoom, UUID> {

    List<ClassRoom> findAllByAcademicYearIdOrderByGradeOrderAscNameAsc(UUID academicYearId);

    List<ClassRoom> findAllBySchoolIdOrderByGradeOrderAscNameAsc(UUID schoolId);

    Optional<ClassRoom> findByIdAndTenantId(UUID id, UUID tenantId);

    Optional<ClassRoom> findBySchoolIdAndAcademicYearIdAndName(UUID schoolId, UUID academicYearId, String name);

    boolean existsBySchoolIdAndAcademicYearIdAndName(UUID schoolId, UUID academicYearId, String name);

    long countBySchoolId(UUID schoolId);
}
