package com.campuscloud.teacher.repository;

import com.campuscloud.teacher.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TeacherRepository extends JpaRepository<Teacher, UUID> {

    boolean existsByEmployeeNo(String employeeNo);

    boolean existsByEmail(String email);
}
