package com.cloudcampus.attendance.service;

import com.cloudcampus.auth.repository.UserRepository;
import com.cloudcampus.notification.entity.NotificationTemplateCode;
import com.cloudcampus.notification.queue.NotificationQueuePublisher;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.repository.StudentParentLinkRepository;
import com.cloudcampus.student.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

/**
 * Sends absence alert emails to every parent linked to an absent student (CC-0803).
 *
 * Runs on the {@code notificationExecutor} thread pool — fully async,
 * never blocks the attendance-save path.
 */
@Service
class AttendanceAlertServiceImpl implements AttendanceAlertService {

    private static final Logger log = LoggerFactory.getLogger(AttendanceAlertServiceImpl.class);

    private final StudentRepository            studentRepo;
    private final StudentParentLinkRepository  linkRepo;
    private final UserRepository               userRepo;
    private final SchoolRepository             schoolRepo;
    private final NotificationQueuePublisher   publisher;

    AttendanceAlertServiceImpl(
            StudentRepository            studentRepo,
            StudentParentLinkRepository  linkRepo,
            UserRepository               userRepo,
            SchoolRepository             schoolRepo,
            NotificationQueuePublisher   publisher) {
        this.studentRepo = studentRepo;
        this.linkRepo    = linkRepo;
        this.userRepo    = userRepo;
        this.schoolRepo  = schoolRepo;
        this.publisher   = publisher;
    }

    @Override
    @Async("notificationExecutor")
    @Transactional(readOnly = true)
    public void alertParentsAsync(UUID tenantId, UUID schoolId,
                                  UUID studentId, LocalDate sessionDate) {
        try {
            var student = studentRepo.findById(studentId).orElse(null);
            if (student == null) return;

            String studentName = student.getFirstName() + " " + student.getLastName();
            String schoolName  = schoolRepo.findById(schoolId)
                    .map(s -> s.getName())
                    .orElse("School");

            Map<String, String> vars = Map.of(
                    "studentName", studentName,
                    "date",        sessionDate.toString(),
                    "schoolName",  schoolName
            );

            var links = linkRepo.findAllByStudentIdOrderByIsPrimaryDescCreatedAtAsc(studentId);
            for (var link : links) {
                userRepo.findById(link.getParentUserId()).ifPresent(user -> {
                    String email = user.getUsername(); // username == email in this system
                    publisher.publishEmail(tenantId, schoolId, email,
                            NotificationTemplateCode.ATTENDANCE_ALERT, vars);
                    log.debug("Queued absence alert: student={} parent={}", studentId, email);
                });
            }
        } catch (Exception ex) {
            log.warn("Failed to send absence alerts for student={}: {}", studentId, ex.getMessage());
        }
    }
}
