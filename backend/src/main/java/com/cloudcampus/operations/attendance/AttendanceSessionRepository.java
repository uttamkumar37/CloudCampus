package com.cloudcampus.operations.attendance;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, String> {

    List<AttendanceSession> findBySchoolIdOrderByAttendanceDateDescCreatedAtDesc(String schoolId);

    List<AttendanceSession> findBySchoolIdAndClassLevelIdAndSubjectIdOrderByAttendanceDateDescCreatedAtDesc(
            String schoolId,
            String classLevelId,
            String subjectId
    );

    Optional<AttendanceSession> findBySchoolIdAndClassLevelIdAndSectionIdAndSubjectIdAndAttendanceDate(
            String schoolId,
            String classLevelId,
            String sectionId,
            String subjectId,
            LocalDate attendanceDate
    );

    Optional<AttendanceSession> findBySchoolIdAndClassLevelIdAndSectionIsNullAndSubjectIdAndAttendanceDate(
            String schoolId,
            String classLevelId,
            String subjectId,
            LocalDate attendanceDate
    );
}
