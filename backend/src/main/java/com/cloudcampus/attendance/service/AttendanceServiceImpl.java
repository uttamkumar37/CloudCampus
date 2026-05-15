package com.cloudcampus.attendance.service;

import com.cloudcampus.attendance.dto.AttendanceRecordEntry;
import com.cloudcampus.attendance.dto.AttendanceRecordResponse;
import com.cloudcampus.attendance.dto.AttendanceSessionResponse;
import com.cloudcampus.attendance.dto.AttendanceSessionSummaryResponse;
import com.cloudcampus.attendance.dto.CreateSessionRequest;
import com.cloudcampus.attendance.dto.MarkAttendanceRequest;
import com.cloudcampus.attendance.dto.StudentAttendanceReport;
import com.cloudcampus.attendance.entity.AttendanceRecord;
import com.cloudcampus.attendance.entity.AttendanceSession;
import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.attendance.repository.AttendanceSessionRepository;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceSessionRepository sessionRepo;
    private final AttendanceRecordRepository  recordRepo;
    private final AttendanceAlertService      alertService;

    AttendanceServiceImpl(AttendanceSessionRepository sessionRepo,
                          AttendanceRecordRepository  recordRepo,
                          AttendanceAlertService      alertService) {
        this.sessionRepo  = sessionRepo;
        this.recordRepo   = recordRepo;
        this.alertService = alertService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Session management
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public AttendanceSessionResponse openSession(UUID schoolId, CreateSessionRequest req) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());

        // Guard: prevent duplicate session
        boolean duplicate;
        if (req.sectionId() != null) {
            duplicate = sessionRepo.findBySchoolIdAndClassIdAndSectionIdAndSessionDateAndPeriodNumber(
                    schoolId, req.classId(), req.sectionId(),
                    req.sessionDate(), req.periodNumber()).isPresent();
        } else {
            duplicate = sessionRepo.findBySchoolIdAndClassIdAndSectionIdIsNullAndSessionDateAndPeriodNumber(
                    schoolId, req.classId(), req.sessionDate(), req.periodNumber()).isPresent();
        }
        if (duplicate) {
            throw new BadRequestException(
                    "An attendance session already exists for this class/section on "
                    + req.sessionDate() + " period " + req.periodNumber());
        }

        AttendanceSession session = AttendanceSession.create(
                tenantId, schoolId, req.classId(), req.academicYearId(),
                req.sessionDate(), req.periodNumber());

        session.setSectionId(req.sectionId());
        session.setSubjectId(req.subjectId());
        session.setTakenByStaffId(req.takenByStaffId());

        AttendanceSession saved = sessionRepo.save(session);
        return AttendanceSessionResponse.from(saved, List.of());
    }

    @Override
    @Transactional
    public AttendanceSessionResponse markAttendance(UUID sessionId, MarkAttendanceRequest req) {
        AttendanceSession session = findSessionOrThrow(sessionId);

        if (session.isFinalized()) {
            throw new BadRequestException(
                    "Session " + sessionId + " is finalized — no further changes are allowed");
        }

        UUID tenantId = session.getTenantId();

        for (AttendanceRecordEntry entry : req.records()) {
            Optional<AttendanceRecord> existing =
                    recordRepo.findBySessionIdAndStudentId(sessionId, entry.studentId());

            if (existing.isPresent()) {
                // Update (correction)
                AttendanceRecord record = existing.get();
                record.setStatus(entry.status());
                record.setRemarks(entry.remarks());
                recordRepo.save(record);
            } else {
                // Create
                AttendanceRecord record = AttendanceRecord.create(
                        tenantId, sessionId, entry.studentId(), entry.status());
                record.setRemarks(entry.remarks());
                recordRepo.save(record);
            }

            if (entry.status() == AttendanceStatus.ABSENT) {
                alertService.alertParentsAsync(
                        tenantId, session.getSchoolId(),
                        entry.studentId(), session.getSessionDate());
            }
        }

        if (req.lockSession()) {
            session.setFinalized(true);
            sessionRepo.save(session);
        }

        // Reload the session to get the updated timestamp, then fetch all records
        AttendanceSession reloaded = findSessionOrThrow(sessionId);
        List<AttendanceRecordResponse> records = recordRepo.findAllBySessionId(sessionId)
                .stream().map(AttendanceRecordResponse::from).toList();

        return AttendanceSessionResponse.from(reloaded, records);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceSessionResponse getSession(UUID sessionId) {
        AttendanceSession session = findSessionOrThrow(sessionId);
        List<AttendanceRecordResponse> records = recordRepo.findAllBySessionId(sessionId)
                .stream().map(AttendanceRecordResponse::from).toList();
        return AttendanceSessionResponse.from(session, records);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Listing
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSessionSummaryResponse> listBySchoolAndDate(UUID schoolId, LocalDate date) {
        return sessionRepo.findAllBySchoolIdAndSessionDateOrderByPeriodNumberAsc(schoolId, date)
                          .stream().map(AttendanceSessionSummaryResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceSessionSummaryResponse> listByClassAndDateRange(
            UUID classId, UUID sectionId, LocalDate from, LocalDate to) {
        List<AttendanceSession> sessions;
        if (sectionId != null) {
            sessions = sessionRepo
                    .findAllByClassIdAndSectionIdAndSessionDateBetweenOrderBySessionDateAscPeriodNumberAsc(
                            classId, sectionId, from, to);
        } else {
            sessions = sessionRepo
                    .findAllByClassIdAndSessionDateBetweenOrderBySessionDateAscPeriodNumberAsc(
                            classId, from, to);
        }
        return sessions.stream().map(AttendanceSessionSummaryResponse::from).toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Reports (CC-0805)
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public StudentAttendanceReport getStudentReport(UUID studentId, LocalDate from, LocalDate to) {
        // 1. Fetch all attendance records for the student
        List<AttendanceRecord> all = recordRepo.findAllByStudentIdOrderByCreatedAtAsc(studentId);

        if (all.isEmpty()) {
            return StudentAttendanceReport.of(studentId, 0L, 0L, 0L, 0L);
        }

        // 2. Get the distinct session IDs referenced by those records
        List<UUID> sessionIds = all.stream()
                .map(AttendanceRecord::getSessionId).distinct().toList();

        // 3. Load session dates for those IDs
        Map<UUID, LocalDate> sessionDateMap = sessionRepo.findAllById(sessionIds)
                .stream().collect(Collectors.toMap(
                        AttendanceSession::getId, AttendanceSession::getSessionDate));

        // 4. Keep only records whose session falls within [from, to]
        List<AttendanceRecord> filtered = all.stream()
                .filter(r -> {
                    LocalDate d = sessionDateMap.get(r.getSessionId());
                    return d != null && !d.isBefore(from) && !d.isAfter(to);
                }).toList();

        return aggregateRecords(studentId, filtered);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentAttendanceReport> getClassReport(
            UUID classId, UUID sectionId, LocalDate from, LocalDate to) {

        // 1. Find sessions for this class/section over the date range
        List<UUID> sessionIds;
        if (sectionId != null) {
            sessionIds = sessionRepo
                    .findAllByClassIdAndSectionIdAndSessionDateBetweenOrderBySessionDateAscPeriodNumberAsc(
                            classId, sectionId, from, to)
                    .stream().map(AttendanceSession::getId).toList();
        } else {
            sessionIds = sessionRepo
                    .findAllByClassIdAndSessionDateBetweenOrderBySessionDateAscPeriodNumberAsc(
                            classId, from, to)
                    .stream().map(AttendanceSession::getId).toList();
        }

        if (sessionIds.isEmpty()) {
            return List.of();
        }

        // 2. Fetch all records for those sessions
        List<AttendanceRecord> records = recordRepo.findAllBySessionIdIn(sessionIds);

        // 3. Group by studentId and aggregate
        Map<UUID, List<AttendanceRecord>> byStudent = records.stream()
                .collect(Collectors.groupingBy(AttendanceRecord::getStudentId));

        return byStudent.entrySet().stream()
                .map(e -> aggregateRecords(e.getKey(), e.getValue()))
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private AttendanceSession findSessionOrThrow(UUID sessionId) {
        return sessionRepo.findById(sessionId)
                .orElseThrow(() -> new NotFoundException(
                        "Attendance session not found: " + sessionId));
    }

    private StudentAttendanceReport aggregateRecords(UUID studentId,
                                                     List<AttendanceRecord> records) {
        Map<AttendanceStatus, Long> counts = new EnumMap<>(AttendanceStatus.class);
        for (AttendanceRecord r : records) {
            counts.merge(r.getStatus(), 1L, Long::sum);
        }
        return StudentAttendanceReport.of(
                studentId,
                counts.getOrDefault(AttendanceStatus.PRESENT,  0L),
                counts.getOrDefault(AttendanceStatus.ABSENT,   0L),
                counts.getOrDefault(AttendanceStatus.LATE,     0L),
                counts.getOrDefault(AttendanceStatus.EXCUSED,  0L)
        );
    }
}
