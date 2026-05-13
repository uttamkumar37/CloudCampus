package com.cloudcampus.staffattendance.repository;

import com.cloudcampus.staffattendance.entity.StaffAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffAttendanceRepository extends JpaRepository<StaffAttendance, UUID> {

    /** All records for a school on a given date. */
    List<StaffAttendance> findAllBySchoolIdAndAttendanceDate(UUID schoolId, LocalDate date);

    /** Single record for a staff member on a specific date (for upsert). */
    Optional<StaffAttendance> findBySchoolIdAndStaffIdAndAttendanceDate(
            UUID schoolId, UUID staffId, LocalDate date);

    /** Attendance history for one staff member, latest first. */
    List<StaffAttendance> findAllBySchoolIdAndStaffIdOrderByAttendanceDateDesc(
            UUID schoolId, UUID staffId);

    /** Summary counts: present/absent/etc. for a date range. */
    @Query("""
           SELECT sa.status, COUNT(sa) FROM StaffAttendance sa
            WHERE sa.schoolId = :schoolId
              AND sa.staffId  = :staffId
              AND sa.attendanceDate BETWEEN :from AND :to
            GROUP BY sa.status
           """)
    List<Object[]> countByStatusForStaff(
            @Param("schoolId") UUID schoolId,
            @Param("staffId")  UUID staffId,
            @Param("from")     LocalDate from,
            @Param("to")       LocalDate to);
}
