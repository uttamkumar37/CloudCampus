package com.cloudcampus.people.parent;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentStudentLinkRepository extends JpaRepository<ParentStudentLink, String> {

    boolean existsByParentUserIdAndStudentId(String parentUserId, String studentId);

    List<ParentStudentLink> findByParentUserId(String parentUserId);

    Optional<ParentStudentLink> findByParentUserIdAndStudentId(String parentUserId, String studentId);
}
