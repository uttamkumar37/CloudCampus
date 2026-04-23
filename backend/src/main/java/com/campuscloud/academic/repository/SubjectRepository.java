package com.campuscloud.academic.repository;

import com.campuscloud.academic.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SubjectRepository extends JpaRepository<Subject, UUID> {

    boolean existsByCode(String code);
}
