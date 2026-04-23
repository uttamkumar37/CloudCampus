package com.campuscloud.student.repository;

import com.campuscloud.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    boolean existsByAdmissionNo(String admissionNo);

    Optional<Student> findByAdmissionNo(String admissionNo);
}
