package com.cloudcampus.timetable.repository;

import com.cloudcampus.timetable.entity.DayOfWeek;
import com.cloudcampus.timetable.entity.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimetableRepository extends JpaRepository<TimetableSlot, UUID> {

    /** All slots for a class+section in an academic year — for grid display. */
    List<TimetableSlot> findBySchoolIdAndAcademicYearIdAndClassIdAndSectionId(
            UUID schoolId, UUID academicYearId, UUID classId, UUID sectionId);

    /** Check section double-booking before insert. */
    Optional<TimetableSlot> findBySchoolIdAndAcademicYearIdAndClassIdAndSectionIdAndDayOfWeekAndPeriodNumber(
            UUID schoolId, UUID academicYearId, UUID classId, UUID sectionId,
            DayOfWeek dayOfWeek, short periodNumber);

    /** Teacher double-booking check — same teacher, same day, same period across any section. */
    @Query("""
            SELECT s FROM TimetableSlot s
             WHERE s.schoolId       = :schoolId
               AND s.academicYearId = :academicYearId
               AND s.staffId        = :staffId
               AND s.dayOfWeek      = :day
               AND s.periodNumber   = :period
            """)
    Optional<TimetableSlot> findTeacherConflict(
            @Param("schoolId") UUID schoolId,
            @Param("academicYearId") UUID academicYearId,
            @Param("staffId") UUID staffId,
            @Param("day") DayOfWeek day,
            @Param("period") short period);

    Optional<TimetableSlot> findBySchoolIdAndId(UUID schoolId, UUID id);

    /** All slots assigned to a specific teacher in an academic year — for teacher self-view. */
    List<TimetableSlot> findBySchoolIdAndAcademicYearIdAndStaffId(
            UUID schoolId, UUID academicYearId, UUID staffId);
}
