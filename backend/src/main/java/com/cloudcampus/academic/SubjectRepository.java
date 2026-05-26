package com.cloudcampus.academic;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, String> {

    Optional<Subject> findBySchoolIdAndCode(String schoolId, String code);

    List<Subject> findBySchoolIdOrderByNameAsc(String schoolId);
}
