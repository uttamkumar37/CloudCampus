package com.campuscloud.parent.repository;

import com.campuscloud.parent.entity.ParentStudent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ParentStudentRepository extends JpaRepository<ParentStudent, UUID> {

    List<ParentStudent> findByParentUserId(UUID parentUserId);
}
