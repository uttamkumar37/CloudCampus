package com.cloudcampus.timetable.dto;

import com.cloudcampus.timetable.entity.DayOfWeek;
import com.cloudcampus.timetable.entity.TimetableSlot;

import java.time.LocalTime;
import java.util.UUID;

public record TimetableSlotResponse(
        UUID id,
        UUID schoolId,
        UUID academicYearId,
        UUID classId,
        UUID sectionId,
        UUID subjectId,
        String subjectName,
        String subjectCode,
        UUID staffId,
        DayOfWeek dayOfWeek,
        int periodNumber,
        LocalTime startTime,
        LocalTime endTime
) {
    public static TimetableSlotResponse from(TimetableSlot s) {
        return from(s, null, null);
    }

    public static TimetableSlotResponse from(TimetableSlot s, String subjectName, String subjectCode) {
        return new TimetableSlotResponse(
                s.getId(),
                s.getSchoolId(),
                s.getAcademicYearId(),
                s.getClassId(),
                s.getSectionId(),
                s.getSubjectId(),
                subjectName,
                subjectCode,
                s.getStaffId(),
                s.getDayOfWeek(),
                s.getPeriodNumber(),
                s.getStartTime(),
                s.getEndTime()
        );
    }
}
