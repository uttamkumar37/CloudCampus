package com.cloudcampus.attendance.repository;

import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    boolean existsByStudentIdAndAttendanceDate(UUID studentId, LocalDate attendanceDate);

    List<AttendanceRecord> findAllByAttendanceDate(LocalDate attendanceDate);

    List<AttendanceRecord> findAllByAttendanceDateBetween(LocalDate startDate, LocalDate endDate);

    List<AttendanceRecord> findTop8ByOrderByCreatedAtDesc();

    long countByAttendanceDateBetweenAndStatusIn(LocalDate startDate, LocalDate endDate, Collection<AttendanceStatus> statuses);

    long countByAttendanceDateBetween(LocalDate startDate, LocalDate endDate);

    // Student dashboard queries
    Optional<AttendanceRecord> findTop1ByStudentIdOrderByAttendanceDateDesc(UUID studentId);

    List<AttendanceRecord> findAllByStudentIdAndAttendanceDateBetween(UUID studentId, LocalDate startDate, LocalDate endDate);

    long countByStudentId(UUID studentId);

    long countByStudentIdAndStatus(UUID studentId, AttendanceStatus status);

    // Teacher dashboard queries
    long countByClassIdAndSectionIdAndAttendanceDateAndMarkedByUserId(UUID classId, UUID sectionId, LocalDate date, UUID markedByUserId);

    List<AttendanceRecord> findTop20ByStudentIdOrderByAttendanceDateDesc(UUID studentId);
}
