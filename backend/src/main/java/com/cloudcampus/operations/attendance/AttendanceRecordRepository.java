package com.cloudcampus.operations.attendance;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, String> {

    List<AttendanceRecord> findBySessionIdOrderByStudentAdmissionNumberAsc(String sessionId);

    List<AttendanceRecord> findByStudentIdOrderBySessionAttendanceDateDesc(String studentId);
}
