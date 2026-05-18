package com.cloudcampus.mobile.service;

import com.cloudcampus.exam.dto.ExamResultResponse;
import com.cloudcampus.finance.dto.StudentFeeRecordResponse;
import com.cloudcampus.homework.dto.HomeworkResponse;
import com.cloudcampus.timetable.dto.TimetableSlotResponse;

import java.util.List;
import java.util.UUID;

/**
 * Parent portal business logic (H-22 — extracted from ParentController).
 *
 * All methods enforce the parent-child link before returning data.
 * Callers do not need to know which repositories or services are involved.
 */
public interface ParentPortalService {

    record ChildSummary(
            UUID   studentId,
            String firstName,
            String lastName,
            String studentNumber,
            String relationship,
            long   totalSessions,
            long   presentCount,
            long   attendancePct
    ) {}

    record AttendanceSummary(
            UUID   studentId,
            String firstName,
            String lastName,
            long   totalSessions,
            long   present,
            long   absent,
            long   late,
            long   attendancePct
    ) {}

    List<ChildSummary>             getLinkedChildren();

    AttendanceSummary              getChildAttendance(UUID studentId);

    List<ExamResultResponse>       getChildResults(UUID studentId);

    List<HomeworkResponse>         getChildHomework(UUID studentId);

    List<TimetableSlotResponse>    getChildTimetable(UUID studentId, UUID academicYearId);

    List<StudentFeeRecordResponse> getChildFees(UUID studentId);
}
