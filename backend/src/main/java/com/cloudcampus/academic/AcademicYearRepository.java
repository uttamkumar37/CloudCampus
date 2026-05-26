package com.cloudcampus.academic;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, String> {

    List<AcademicYear> findBySchoolIdOrderByStartDateDesc(String schoolId);

    List<AcademicYear> findBySchoolIdAndStatus(String schoolId, AcademicYearStatus status);

    Optional<AcademicYear> findBySchoolIdAndName(String schoolId, String name);
}
