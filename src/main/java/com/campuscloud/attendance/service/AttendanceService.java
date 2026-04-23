package com.campuscloud.attendance.service;

import com.campuscloud.attendance.dto.AttendanceCreateRequest;
import com.campuscloud.attendance.dto.AttendanceResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AttendanceService {

    AttendanceResponse markAttendance(AttendanceCreateRequest request);

    AttendanceResponse getAttendanceById(UUID attendanceId);

    List<AttendanceResponse> getAttendanceByDate(LocalDate date);
}
