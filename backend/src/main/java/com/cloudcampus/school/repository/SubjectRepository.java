package com.cloudcampus.school.repository;

import com.cloudcampus.school.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubjectRepository extends JpaRepository<Subject, UUID> {

    List<Subject> findAllBySchoolIdOrderByNameAsc(UUID schoolId);

    List<Subject> findAllBySchoolIdAndIsActiveOrderByNameAsc(UUID schoolId, boolean isActive);

    Optional<Subject> findBySchoolIdAndCode(UUID schoolId, String code);

    boolean existsBySchoolIdAndCode(UUID schoolId, String code);
}
