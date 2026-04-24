package com.campuscloud.academic.repository;

import com.campuscloud.academic.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, UUID> {

    boolean existsByCode(String code);

    Optional<SchoolClass> findByCode(String code);
}
