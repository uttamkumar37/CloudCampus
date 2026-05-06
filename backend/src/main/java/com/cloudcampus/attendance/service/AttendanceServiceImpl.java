package com.cloudcampus.attendance.service;

import com.cloudcampus.academic.repository.SchoolClassRepository;
import com.cloudcampus.academic.repository.SectionRepository;
import com.cloudcampus.attendance.dto.AttendanceCreateRequest;
import com.cloudcampus.attendance.dto.AttendanceResponse;
import com.cloudcampus.attendance.entity.AttendanceRecord;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.auth.security.CloudCampusUserDetails;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.tenant.service.TenantContext;
import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
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
        attendanceRecord.setMarkedByUserId(resolveActorUserId(request.markedByUserId()));

        AttendanceRecord saved = attendanceRecordRepository.save(attendanceRecord);
        log.info("Attendance marked: studentId={}, date={}, status={}, tenant={}",
                saved.getStudentId(), saved.getAttendanceDate(), saved.getStatus(), TenantContext.getTenant());
        return map(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getAttendanceById(UUID attendanceId, @Nullable Set<UUID> allowedStudentIds) {
        validateTenantContext();
        AttendanceRecord record = attendanceRecordRepository.findById(attendanceId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found: " + attendanceId));
        if (allowedStudentIds != null && !allowedStudentIds.contains(record.getStudentId())) {
            throw new AccessDeniedException("Access denied to attendance record: " + attendanceId);
        }
        return map(record);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByDate(LocalDate date, @Nullable Set<UUID> allowedStudentIds) {
        validateTenantContext();
        // FIXED: was findAllByAttendanceDate() (loads entire day) then filter in-memory.
        // When the caller is a STUDENT or PARENT, push the filter into the DB query so
        // only the relevant rows are fetched.
        List<AttendanceRecord> records = (allowedStudentIds != null)
                ? attendanceRecordRepository.findAllByAttendanceDateAndStudentIdIn(date, allowedStudentIds)
                : attendanceRecordRepository.findAllByAttendanceDate(date);
        return records.stream().map(this::map).toList();
    }

    private void validateTenantContext() {
        if (TenantContext.DEFAULT_SCHEMA.equals(TenantContext.getTenant())) {
            throw new IllegalArgumentException("X-Tenant-Slug header is required for attendance operations");
        }
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private UUID resolveActorUserId(UUID requestedUserId) {
        if (requestedUserId != null) {
            return requestedUserId;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CloudCampusUserDetails principal) || principal.getUserId() == null) {
            throw new IllegalArgumentException("Unable to resolve acting user from authentication context");
        }
        return principal.getUserId();
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
