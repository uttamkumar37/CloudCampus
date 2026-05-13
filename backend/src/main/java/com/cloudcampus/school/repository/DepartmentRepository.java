package com.cloudcampus.school.repository;

import com.cloudcampus.school.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    List<Department> findAllBySchoolIdOrderByNameAsc(UUID schoolId);

    List<Department> findAllBySchoolIdAndIsActiveOrderByNameAsc(UUID schoolId, boolean isActive);

    Optional<Department> findBySchoolIdAndName(UUID schoolId, String name);

    Optional<Department> findBySchoolIdAndCode(UUID schoolId, String code);

    boolean existsBySchoolIdAndName(UUID schoolId, String name);

    boolean existsBySchoolIdAndCode(UUID schoolId, String code);
}
