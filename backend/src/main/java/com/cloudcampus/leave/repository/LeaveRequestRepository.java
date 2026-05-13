package com.cloudcampus.leave.repository;

import com.cloudcampus.leave.entity.LeaveRequest;
import com.cloudcampus.leave.entity.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    /** Paginated list filtered by school; optional status and/or staff filters. */
    @Query("""
           SELECT lr FROM LeaveRequest lr
            WHERE lr.schoolId = :schoolId
              AND (:status  IS NULL OR lr.status  = :status)
              AND (:staffId IS NULL OR lr.staffId = :staffId)
            ORDER BY lr.createdAt DESC
           """)
    Page<LeaveRequest> findFiltered(
            @Param("schoolId") UUID schoolId,
            @Param("status")   LeaveStatus status,
            @Param("staffId")  UUID staffId,
            Pageable pageable);

    /** All PENDING requests for a school, oldest first (for review queue). */
    List<LeaveRequest> findAllBySchoolIdAndStatusOrderByCreatedAtAsc(
            UUID schoolId, LeaveStatus status);

    Optional<LeaveRequest> findBySchoolIdAndId(UUID schoolId, UUID id);

    long countBySchoolIdAndStatus(UUID schoolId, LeaveStatus status);
}
