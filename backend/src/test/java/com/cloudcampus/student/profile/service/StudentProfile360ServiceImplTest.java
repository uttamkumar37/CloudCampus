package com.cloudcampus.student.profile.service;

import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.assignment.repository.SubmissionRepository;
import com.cloudcampus.audit.service.AuditLogService;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.homework.repository.HomeworkSubmissionRepository;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.entity.SchoolStatus;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.ClassRoomRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.school.repository.SectionRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.profile.dto.StudentProfile360Response;
import com.cloudcampus.student.profile.repository.StudentAchievementRecordRepository;
import com.cloudcampus.student.profile.repository.StudentBehaviorRecordRepository;
import com.cloudcampus.student.profile.repository.StudentCommunicationEventRepository;
import com.cloudcampus.student.profile.repository.StudentEnrichmentProfileRepository;
import com.cloudcampus.student.profile.repository.StudentIdentityProfileRepository;
import com.cloudcampus.student.profile.repository.StudentLogisticsProfileRepository;
import com.cloudcampus.student.profile.repository.StudentMedicalRecordRepository;
import com.cloudcampus.student.repository.StudentDocumentRepository;
import com.cloudcampus.student.repository.StudentParentLinkRepository;
import com.cloudcampus.student.repository.StudentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentProfile360ServiceImplTest {

    private static final UUID TENANT_ID = UUID.randomUUID();
    private static final UUID SCHOOL_ID = UUID.randomUUID();
    private static final UUID STUDENT_ID = UUID.randomUUID();
    private static final PageRequest RECENT_FIVE = PageRequest.of(0, 5);

    @Mock StudentRepository studentRepo;
    @Mock StudentIdentityProfileRepository identityRepo;
    @Mock StudentLogisticsProfileRepository logisticsRepo;
    @Mock StudentEnrichmentProfileRepository enrichmentRepo;
    @Mock StudentMedicalRecordRepository medicalRepo;
    @Mock StudentBehaviorRecordRepository behaviorRepo;
    @Mock StudentAchievementRecordRepository achievementRepo;
    @Mock StudentCommunicationEventRepository communicationRepo;
    @Mock AttendanceRecordRepository attendanceRepo;
    @Mock StudentFeeRecordRepository feeRecordRepo;
    @Mock StudentDocumentRepository documentRepo;
    @Mock StudentParentLinkRepository parentLinkRepo;
    @Mock SchoolRepository schoolRepo;
    @Mock ClassRoomRepository classRoomRepo;
    @Mock SectionRepository sectionRepo;
    @Mock AcademicYearRepository academicYearRepo;
    @Mock ExamResultRepository examResultRepo;
    @Mock SubmissionRepository assignmentSubmissionRepo;
    @Mock HomeworkSubmissionRepository homeworkSubmissionRepo;
    @Mock AuditLogService auditLogService;

    StudentProfile360ServiceImpl service;

    @BeforeEach
    void setUp() {
        RequestContext.setTenantId(TENANT_ID.toString());
        service = new StudentProfile360ServiceImpl(
                studentRepo,
                identityRepo,
                logisticsRepo,
                enrichmentRepo,
                medicalRepo,
                behaviorRepo,
                achievementRepo,
                communicationRepo,
                attendanceRepo,
                feeRecordRepo,
                documentRepo,
                parentLinkRepo,
                schoolRepo,
                classRoomRepo,
                sectionRepo,
                academicYearRepo,
                examResultRepo,
                assignmentSubmissionRepo,
                homeworkSubmissionRepo,
                auditLogService);
    }

    @AfterEach
    void tearDown() {
        RequestContext.clearAll();
    }

    @Test
    void getSelfProfile_redactsRestrictedSectionsAndSensitiveAggregates() {
        Student student = student();
        when(studentRepo.findByIdAndTenantId(STUDENT_ID, TENANT_ID)).thenReturn(Optional.of(student));
        when(schoolRepo.findByIdFiltered(SCHOOL_ID)).thenReturn(Optional.of(school()));
        when(academicYearRepo.findBySchoolIdAndIsCurrent(SCHOOL_ID, true)).thenReturn(Optional.empty());
        when(identityRepo.findByStudentId(STUDENT_ID)).thenReturn(Optional.empty());
        when(logisticsRepo.findByStudentId(STUDENT_ID)).thenReturn(Optional.empty());
        when(enrichmentRepo.findByStudentId(STUDENT_ID)).thenReturn(Optional.empty());
        when(medicalRepo.findByStudentIdOrderByRecordedAtDesc(STUDENT_ID, RECENT_FIVE))
                .thenReturn(List.of());
        when(behaviorRepo.findByStudentIdOrderByRecordedAtDesc(STUDENT_ID, RECENT_FIVE))
                .thenReturn(List.of());
        when(achievementRepo.findByStudentIdOrderByCreatedAtDesc(STUDENT_ID, RECENT_FIVE))
                .thenReturn(List.of());
        when(communicationRepo.findByStudentIdOrderByOccurredAtDesc(STUDENT_ID, RECENT_FIVE))
                .thenReturn(List.of());
        when(feeRecordRepo.findByStudentId(STUDENT_ID)).thenReturn(List.of());
        when(examResultRepo.findByStudentIdAndSchoolIdOrderByCreatedAtDesc(STUDENT_ID, SCHOOL_ID))
                .thenReturn(List.of());
        when(assignmentSubmissionRepo.findByStudentIdAndSchoolIdOrderByUpdatedAtDesc(
                STUDENT_ID, SCHOOL_ID, RECENT_FIVE)).thenReturn(List.of());
        when(homeworkSubmissionRepo.findByStudentIdOrderBySubmittedAtDesc(
                STUDENT_ID, RECENT_FIVE)).thenReturn(List.of());

        StudentProfile360Response response = service.getSelfProfile(STUDENT_ID);

        assertThat(response.sections())
                .extracting(section -> section.key())
                .doesNotContain("identity", "contact", "guardians", "health", "behavior", "finance", "communication", "ai");
        assertThat(response.sections())
                .allSatisfy(section -> {
                    assertThat(section.editable()).isFalse();
                    assertThat(section.visibility()).isNotIn("STAFF_ONLY", "ADMIN_ONLY", "PRIVATE", "COUNSELOR", "FINANCE", "HEALTH");
                });
        assertThat(response.aiInsights()).isEmpty();
        assertThat(response.healthWellbeing()).isEmpty();
        assertThat(response.parentFamily()).isEmpty();
        assertThat(response.riskProfile()).isEmpty();
        assertThat(response.communicationCenter()).isEmpty();
        assertThat(response.quickStats()).doesNotContainKeys("guardians", "medicalRecords", "behaviorRecords", "feeBalance");
        assertThat(response.header()).doesNotContainKeys("aiRiskScore", "bloodGroup", "scholarshipStatus", "quickActions");
    }

    private Student student() {
        Student student = Student.create(
                TENANT_ID,
                SCHOOL_ID,
                "STU-SELF-001",
                "Self",
                "Student",
                LocalDate.now());
        ReflectionTestUtils.setField(student, "id", STUDENT_ID);
        ReflectionTestUtils.setField(student, "createdAt", Instant.now());
        ReflectionTestUtils.setField(student, "updatedAt", Instant.now());
        return student;
    }

    private School school() {
        return new School(
                SCHOOL_ID,
                TENANT_ID,
                "Self Profile School",
                "MAIN",
                SchoolStatus.ACTIVE,
                Instant.now());
    }
}
