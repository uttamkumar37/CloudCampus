package com.cloudcampus.academic;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassLevelRepository extends JpaRepository<ClassLevel, String> {

    List<ClassLevel> findByAcademicYearIdOrderByDisplayOrderAscNameAsc(String academicYearId);

    Optional<ClassLevel> findByAcademicYearIdAndName(String academicYearId, String name);
}
