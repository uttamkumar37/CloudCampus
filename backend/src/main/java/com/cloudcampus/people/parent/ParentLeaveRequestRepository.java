package com.cloudcampus.people.parent;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentLeaveRequestRepository extends JpaRepository<ParentLeaveRequest, String> {

    List<ParentLeaveRequest> findByParentUserIdAndStudentIdOrderByCreatedAtDesc(String parentUserId, String studentId);

    List<ParentLeaveRequest> findBySchoolIdOrderByCreatedAtDesc(String schoolId);
}
