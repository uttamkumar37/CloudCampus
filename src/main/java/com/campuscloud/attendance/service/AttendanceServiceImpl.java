package com.campuscloud.attendance.service;

import com.campuscloud.academic.repository.SchoolClassRepository;
import com.campuscloud.academic.repository.SectionRepository;
import com.campuscloud.attendance.dto.AttendanceCreateRequest;
import com.campuscloud.attendance.dto.AttendanceResponse;
import com.campuscloud.attendance.entity.AttendanceRecord;
import com.campuscloud.attendance.repository.AttendanceRecordRepository;
import com.campuscloud.student.repository.StudentRepository;
import com.campuscloud.tenant.service.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;

    @Override
    @Transactional
    public AttendanceResponse markAttendance(AttendanceCreateRequest request) {
        validateTenantContext();

        if (!studentRepository.existsById(request.studentId())) {
            throw new IllegalArgumentException("Student not found: " + request.studentId());
        }
        if (!schoolClassRepository.existsById(request.classId())) {
            throw new IllegalArgumentException("Class not found: " + request.classId());
        }
        if (!sectionRepository.existsById(request.sectionId())) {
            throw new IllegalArgumentException("Section not found: " + request.sectionId());
        }
        if (attendanceRecordRepository.existsByStudentIdAndAttendanceDate(request.studentId(), request.attendanceDate())) {
            throw new IllegalArgumentException("Attendance already marked for student on date: " + request.attendanceDate());
        }

        AttendanceRecord attendanceRecord = new AttendanceRecord();
        attendanceRecord.setStudentId(request.studentId());
        attendanceRecord.setClassId(request.classId());
        attendanceRecord.setSectionId(request.sectionId());
        attendanceRecord.setAttendanceDate(request.attendanceDate());
        attendanceRecord.setStatus(request.status());
        attendanceRecord.setRemarks(normalizeNullable(request.remarks()));
        attendanceRecord.setMarkedByUserId(request.markedByUserId());

        AttendanceRecord saved = attendanceRecordRepository.save(attendanceRecord);
        log.info("Attendance marked: studentId={}, date={}, status={}, tenant={}",
                saved.getStudentId(), saved.getAttendanceDate(), saved.getStatus(), TenantContext.getTenant());
        return map(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getAttendanceById(UUID attendanceId) {
        validateTenantContext();
        AttendanceRecord record = attendanceRecordRepository.findById(attendanceId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found: " + attendanceId));
        return map(record);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        validateTenantContext();
        return attendanceRecordRepository.findAllByAttendanceDate(date).stream().map(this::map).toList();
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-ID header is required for attendance operations");
        }
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private AttendanceResponse map(AttendanceRecord record) {
        return new AttendanceResponse(
                record.getId(),
                record.getStudentId(),
                record.getClassId(),
                record.getSectionId(),
                record.getAttendanceDate(),
                record.getStatus(),
                record.getRemarks(),
                record.getMarkedByUserId(),
                record.getCreatedAt()
        );
    }
}
