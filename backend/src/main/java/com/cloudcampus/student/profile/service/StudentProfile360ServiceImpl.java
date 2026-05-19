package com.cloudcampus.student.profile.service;

import com.cloudcampus.attendance.entity.AttendanceStatus;
import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.assignment.entity.AssignmentSubmission;
import com.cloudcampus.assignment.repository.SubmissionRepository;
import com.cloudcampus.audit.service.AuditLogService;
import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.finance.entity.StudentFeeRecord;
import com.cloudcampus.finance.repository.StudentFeeRecordRepository;
import com.cloudcampus.homework.entity.HomeworkSubmission;
import com.cloudcampus.homework.repository.HomeworkSubmissionRepository;
import com.cloudcampus.school.entity.AcademicYear;
import com.cloudcampus.school.entity.ClassRoom;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.entity.Section;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.ClassRoomRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.school.repository.SectionRepository;
import com.cloudcampus.student.entity.Gender;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.profile.dto.ProfileSectionResponse;
import com.cloudcampus.student.profile.dto.StudentProfile360Response;
import com.cloudcampus.student.profile.dto.TimelineItemResponse;
import com.cloudcampus.student.profile.dto.UpdateProfileSectionRequest;
import com.cloudcampus.student.profile.entity.StudentAchievementRecord;
import com.cloudcampus.student.profile.entity.StudentBehaviorRecord;
import com.cloudcampus.student.profile.entity.StudentCommunicationEvent;
import com.cloudcampus.student.profile.entity.StudentEnrichmentProfile;
import com.cloudcampus.student.profile.entity.StudentIdentityProfile;
import com.cloudcampus.student.profile.entity.StudentLogisticsProfile;
import com.cloudcampus.student.profile.entity.StudentMedicalRecord;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
class StudentProfile360ServiceImpl implements StudentProfile360Service {

    private static final PageRequest RECENT_FIVE = PageRequest.of(0, 5);

    private final StudentRepository studentRepo;
    private final StudentIdentityProfileRepository identityRepo;
    private final StudentLogisticsProfileRepository logisticsRepo;
    private final StudentEnrichmentProfileRepository enrichmentRepo;
    private final StudentMedicalRecordRepository medicalRepo;
    private final StudentBehaviorRecordRepository behaviorRepo;
    private final StudentAchievementRecordRepository achievementRepo;
    private final StudentCommunicationEventRepository communicationRepo;
    private final AttendanceRecordRepository attendanceRepo;
    private final StudentFeeRecordRepository feeRecordRepo;
    private final StudentDocumentRepository documentRepo;
    private final StudentParentLinkRepository parentLinkRepo;
    private final SchoolRepository schoolRepo;
    private final ClassRoomRepository classRoomRepo;
    private final SectionRepository sectionRepo;
    private final AcademicYearRepository academicYearRepo;
    private final ExamResultRepository examResultRepo;
    private final SubmissionRepository assignmentSubmissionRepo;
    private final HomeworkSubmissionRepository homeworkSubmissionRepo;
    private final AuditLogService auditLogService;

    StudentProfile360ServiceImpl(StudentRepository studentRepo,
                                 StudentIdentityProfileRepository identityRepo,
                                 StudentLogisticsProfileRepository logisticsRepo,
                                 StudentEnrichmentProfileRepository enrichmentRepo,
                                 StudentMedicalRecordRepository medicalRepo,
                                 StudentBehaviorRecordRepository behaviorRepo,
                                 StudentAchievementRecordRepository achievementRepo,
                                 StudentCommunicationEventRepository communicationRepo,
                                 AttendanceRecordRepository attendanceRepo,
                                 StudentFeeRecordRepository feeRecordRepo,
                                 StudentDocumentRepository documentRepo,
                                 StudentParentLinkRepository parentLinkRepo,
                                 SchoolRepository schoolRepo,
                                 ClassRoomRepository classRoomRepo,
                                 SectionRepository sectionRepo,
                                 AcademicYearRepository academicYearRepo,
                                 ExamResultRepository examResultRepo,
                                 SubmissionRepository assignmentSubmissionRepo,
                                 HomeworkSubmissionRepository homeworkSubmissionRepo,
                                 AuditLogService auditLogService) {
        this.studentRepo = studentRepo;
        this.identityRepo = identityRepo;
        this.logisticsRepo = logisticsRepo;
        this.enrichmentRepo = enrichmentRepo;
        this.medicalRepo = medicalRepo;
        this.behaviorRepo = behaviorRepo;
        this.achievementRepo = achievementRepo;
        this.communicationRepo = communicationRepo;
        this.attendanceRepo = attendanceRepo;
        this.feeRecordRepo = feeRecordRepo;
        this.documentRepo = documentRepo;
        this.parentLinkRepo = parentLinkRepo;
        this.schoolRepo = schoolRepo;
        this.classRoomRepo = classRoomRepo;
        this.sectionRepo = sectionRepo;
        this.academicYearRepo = academicYearRepo;
        this.examResultRepo = examResultRepo;
        this.assignmentSubmissionRepo = assignmentSubmissionRepo;
        this.homeworkSubmissionRepo = homeworkSubmissionRepo;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentProfile360Response getProfile(UUID studentId) {
        Student student = findStudent(studentId);
        return build(student);
    }

    @Override
    @Transactional
    public StudentProfile360Response updateSection(UUID studentId, String sectionKey, UpdateProfileSectionRequest request) {
        Student student = findStudent(studentId);
        Map<String, Object> data = request.data();
        String normalized = sectionKey.trim().toLowerCase();

        switch (normalized) {
            case "personal" -> updatePersonal(student, data);
            case "identity" -> updateIdentity(student, data);
            case "contact" -> updateContact(student, data);
            case "interests", "skills", "ai" -> updateEnrichment(student, data);
            case "transport" -> updateLogistics(student, data);
            case "health" -> addMedicalRecord(student, data);
            case "behavior" -> addBehaviorRecord(student, data);
            case "achievements" -> addAchievement(student, data);
            case "communication" -> addCommunication(student, data);
            default -> throw new BadRequestException("Unsupported student profile section: " + sectionKey);
        }

        auditLogService.logStudentProfileSectionUpdated(
                RequestContext.getUserId(), student.getTenantId(), student.getId(), normalized);
        return build(studentRepo.findByIdAndTenantId(studentId, student.getTenantId()).orElse(student));
    }

    private StudentProfile360Response build(Student student) {
        UUID studentId = student.getId();
        UUID tenantId = student.getTenantId();
        UUID schoolId = student.getSchoolId();
        School school = schoolRepo.findByIdFiltered(schoolId).orElse(null);
        ClassRoom classRoom = student.getClassId() == null ? null
                : classRoomRepo.findByIdAndTenantId(student.getClassId(), tenantId).orElse(null);
        Section sectionRef = student.getSectionId() == null ? null
                : sectionRepo.findByIdAndTenantId(student.getSectionId(), tenantId).orElse(null);
        AcademicYear academicYear = classRoom == null
                ? academicYearRepo.findBySchoolIdAndIsCurrent(schoolId, true).orElse(null)
                : academicYearRepo.findByIdAndTenantId(classRoom.getAcademicYearId(), tenantId).orElse(null);
        StudentIdentityProfile identity = identityRepo.findByStudentId(studentId).orElse(null);
        StudentLogisticsProfile logistics = logisticsRepo.findByStudentId(studentId).orElse(null);
        StudentEnrichmentProfile enrichment = enrichmentRepo.findByStudentId(studentId).orElse(null);
        List<StudentMedicalRecord> medical = medicalRepo.findByStudentIdOrderByRecordedAtDesc(studentId, RECENT_FIVE);
        List<StudentBehaviorRecord> behavior = behaviorRepo.findByStudentIdOrderByRecordedAtDesc(studentId, RECENT_FIVE);
        List<StudentAchievementRecord> achievements = achievementRepo.findByStudentIdOrderByCreatedAtDesc(studentId, RECENT_FIVE);
        List<StudentCommunicationEvent> communications = communicationRepo.findByStudentIdOrderByOccurredAtDesc(studentId, RECENT_FIVE);
        List<ExamResult> examResults = examResultRepo.findByStudentIdAndSchoolIdOrderByCreatedAtDesc(studentId, schoolId);
        List<AssignmentSubmission> assignmentSubmissions =
                assignmentSubmissionRepo.findByStudentIdAndSchoolIdOrderByUpdatedAtDesc(studentId, schoolId, RECENT_FIVE);
        List<HomeworkSubmission> homeworkSubmissions =
                homeworkSubmissionRepo.findByStudentIdOrderBySubmittedAtDesc(studentId, RECENT_FIVE);

        long attendanceTotal = attendanceRepo.countByStudentId(studentId);
        long present = attendanceRepo.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
        long absent = attendanceRepo.countByStudentIdAndStatus(studentId, AttendanceStatus.ABSENT);
        long late = attendanceRepo.countByStudentIdAndStatus(studentId, AttendanceStatus.LATE);
        int attendancePercent = attendanceTotal == 0 ? 0 : (int) Math.round((present * 100.0) / attendanceTotal);

        List<StudentFeeRecord> fees = feeRecordRepo.findByStudentId(studentId);
        BigDecimal feeDue = BigDecimal.ZERO;
        BigDecimal feePaid = BigDecimal.ZERO;
        BigDecimal feeBalance = BigDecimal.ZERO;
        for (StudentFeeRecord fee : fees) {
            feeDue = feeDue.add(fee.getAmountDue());
            feePaid = feePaid.add(fee.getAmountPaid());
            feeBalance = feeBalance.add(fee.getAmountDue()).subtract(fee.getDiscount()).subtract(fee.getAmountPaid());
        }

        long documentCount = documentRepo.countByStudentId(studentId);
        long parentCount = parentLinkRepo.countByStudentId(studentId);
        long assignmentCount = assignmentSubmissionRepo.countByStudentIdAndSchoolId(studentId, schoolId);
        long homeworkCount = homeworkSubmissionRepo.countByStudentId(studentId);

        List<TimelineItemResponse> timeline = timeline(medical, behavior, achievements, communications,
                examResults, assignmentSubmissions, homeworkSubmissions, student);
        List<ProfileSectionResponse> sections = new ArrayList<>();
        sections.add(section("personal", "Personal Details", "Core admission and demographic information.", "SCHOOL_ADMIN", true,
                personalData(student), List.of()));
        sections.add(section("identity", "Identity Information", "Identity, language, and previous-school information.", "ADMIN_ONLY", true,
                identityData(identity), List.of()));
        sections.add(section("contact", "Contact & Address", "Primary contact and emergency contact information.", "SCHOOL_ADMIN", true,
                contactData(student, identity), List.of()));
        sections.add(section("guardians", "Parent/Guardian Details", "Linked parent and guardian account summary.", "SCHOOL_ADMIN", false,
                map("linkedGuardians", parentCount), List.of()));
        sections.add(section("academics", "Academic Records", "Current placement and academic lifecycle state.", "SCHOOL_ADMIN", false,
                map("classId", student.getClassId(), "sectionId", student.getSectionId(), "status", student.getStatus(), "admissionDate", student.getAdmissionDate()), List.of()));
        sections.add(section("attendance", "Attendance Analytics", "Attendance totals and risk signals.", "SCHOOL_ADMIN", false,
                map("totalRecords", attendanceTotal, "present", present, "absent", absent, "late", late, "attendancePercent", attendancePercent), List.of()));
        sections.add(section("health", "Health & Medical Records", "Medical conditions, medication, and school nurse notes.", "HEALTH", true,
                map("recordCount", medicalRepo.countByStudentId(studentId), "recentRecords", medicalRows(medical)), medicalTimeline(medical)));
        sections.add(section("behavior", "Behavior & Counseling", "Behavior observations, interventions, and counselor notes.", "COUNSELOR", true,
                map("recordCount", behaviorRepo.countByStudentId(studentId), "recentRecords", behaviorRows(behavior),
                        "counselingSummary", enrichment == null ? null : enrichment.getCounselingSummary()), behaviorTimeline(behavior)));
        sections.add(section("interests", "Interests, Hobbies, Likes/Dislikes", "Student interests and engagement signals.", "SCHOOL_ADMIN", true,
                interestsData(enrichment), List.of()));
        sections.add(section("skills", "Skills & Career Goals", "Skills, learning style, and career goals.", "SCHOOL_ADMIN", true,
                skillsData(enrichment), List.of()));
        sections.add(section("finance", "Fees & Finance", "Fee ledger snapshot for finance follow-up.", "FINANCE", false,
                map("recordCount", fees.size(), "amountDue", feeDue, "amountPaid", feePaid, "balance", feeBalance), List.of()));
        sections.add(section("transport", "Transport & Hostel", "Transport route, pickup/drop, and hostel details.", "SCHOOL_ADMIN", true,
                logisticsData(logistics), List.of()));
        sections.add(section("documents", "Documents Vault", "Secure student document summary.", "SCHOOL_ADMIN", false,
                map("documentCount", documentCount), List.of()));
        sections.add(section("achievements", "Achievements & Portfolio", "Awards, portfolio evidence, and co-curricular milestones.", "SCHOOL_ADMIN", true,
                map("recordCount", achievementRepo.countByStudentId(studentId), "recentRecords", achievementRows(achievements)), achievementTimeline(achievements)));
        sections.add(section("communication", "Communication Timeline", "Recent family, student, and internal communication.", "SCHOOL_ADMIN", true,
                map("recordCount", communicationRepo.countByStudentId(studentId), "recentRecords", communicationRows(communications)), communicationTimeline(communications)));
        sections.add(section("ai", "AI Insights & Risk Analysis", "AI-assisted risk notes and recommended follow-up.", "COUNSELOR", true,
                aiData(enrichment, attendancePercent, feeBalance, absent), List.of()));

        int profileCompletion = (int) Math.round(sections.stream().mapToInt(ProfileSectionResponse::completionPercent).average().orElse(0));
        Map<String, Object> quickStats = map(
                "attendancePercent", attendancePercent,
                "feeBalance", feeBalance,
                "documents", documentCount,
                "guardians", parentCount,
                "medicalRecords", medicalRepo.countByStudentId(studentId),
                "behaviorRecords", behaviorRepo.countByStudentId(studentId),
                "achievements", achievementRepo.countByStudentId(studentId)
        );
        Map<String, Object> header = headerData(student, school, classRoom, sectionRef, academicYear, logistics,
                enrichment, attendancePercent, feeBalance, documentCount, achievements.size());
        Map<String, Object> completionDetails = completionData(sections);
        Map<String, Object> activityFeed = activityFeedData(timeline);
        List<Map<String, Object>> aiInsights = aiInsights(enrichment, attendancePercent, absent, feeBalance,
                examResults, behavior, medical, achievements);
        Map<String, Object> academicAnalytics = academicAnalytics(examResults, assignmentCount, homeworkCount);
        Map<String, Object> healthWellbeing = healthWellbeing(student, identity, medical);
        Map<String, Object> parentFamily = parentFamily(parentCount, communications);
        List<Map<String, Object>> riskProfile = riskProfile(attendancePercent, absent, feeBalance, behavior, medical, examResults);
        Map<String, Object> documentVault = documentVault(documentCount);
        Map<String, Object> communicationCenter = communicationCenter(communications);

        return new StudentProfile360Response(studentId, profileCompletion, sections, timeline, quickStats,
                header, completionDetails, activityFeed, aiInsights, academicAnalytics, healthWellbeing,
                parentFamily, riskProfile, documentVault, communicationCenter);
    }

    private Map<String, Object> headerData(Student student, School school, ClassRoom classRoom, Section section,
                                           AcademicYear academicYear, StudentLogisticsProfile logistics,
                                           StudentEnrichmentProfile enrichment, int attendancePercent,
                                           BigDecimal feeBalance, long documentCount, int recentAchievementCount) {
        String transportStatus = logistics != null && logistics.getRouteName() != null ? "ASSIGNED" : "NOT_ASSIGNED";
        String hostelStatus = logistics != null && logistics.getHostelName() != null ? "RESIDENT" : "DAY_SCHOLAR";
        String aiRiskLevel = String.valueOf(aiData(enrichment, attendancePercent, feeBalance, 0).get("aiRiskLevel"));
        int riskScore = switch (aiRiskLevel) {
            case "HIGH" -> 82;
            case "WATCH" -> 58;
            default -> 18;
        };
        List<Map<String, Object>> badges = new ArrayList<>();
        if (attendancePercent >= 95) badges.add(badge("Attendance Champion", "green"));
        if (recentAchievementCount > 0) badges.add(badge("Olympiad Winner", "amber"));
        if (feeBalance.signum() == 0) badges.add(badge("Scholarship Ready", "blue"));
        if (riskScore <= 25) badges.add(badge("AI Recommended", "violet"));
        if (badges.isEmpty()) badges.add(badge("Growth Watch", "slate"));

        return map(
                "photoUrl", student.getPhotoUrl(),
                "fullName", student.getFirstName() + " " + student.getLastName(),
                "preferredName", student.getFirstName(),
                "admissionNumber", student.getStudentNumber(),
                "rollNumber", student.getStudentNumber(),
                "className", classRoom == null ? null : value(classRoom.getDisplayName(), classRoom.getName()),
                "sectionName", section == null ? null : section.getName(),
                "academicYear", academicYear == null ? null : academicYear.getName(),
                "campus", school == null ? null : school.getName(),
                "house", null,
                "status", student.getStatus(),
                "bloodGroup", student.getBloodGroup(),
                "transportStatus", transportStatus,
                "hostelStatus", hostelStatus,
                "scholarshipStatus", feeBalance.signum() == 0 ? "ELIGIBLE_REVIEW" : "FINANCE_REVIEW",
                "attendanceStreak", attendancePercent >= 95 ? "Excellent" : attendancePercent >= 85 ? "Stable" : "Needs attention",
                "lastActive", student.getUpdatedAt(),
                "aiRiskScore", riskScore,
                "badges", badges,
                "quickActions", List.of("Edit Core", "Add Note", "Upload Document", "Message Parent")
        );
    }

    private Map<String, Object> badge(String label, String tone) {
        return map("label", label, "tone", tone);
    }

    private Map<String, Object> completionData(List<ProfileSectionResponse> sections) {
        List<Map<String, Object>> sectionSummaries = sections.stream()
                .map(s -> map("key", s.key(), "title", s.title(), "completionPercent", s.completionPercent(),
                        "missingFields", missingFields(s.data())))
                .toList();
        List<String> missingFields = sectionSummaries.stream()
                .flatMap(s -> ((List<?>) s.get("missingFields")).stream())
                .map(String::valueOf)
                .limit(12)
                .toList();
        List<String> suggestedActions = sections.stream()
                .filter(s -> s.completionPercent() < 70)
                .map(s -> "Complete " + s.title())
                .limit(6)
                .toList();
        List<String> warnings = sections.stream()
                .filter(s -> s.completionPercent() < 35)
                .map(s -> s.title() + " is under-filled")
                .limit(5)
                .toList();
        return map("sections", sectionSummaries, "missingFields", missingFields,
                "suggestedActions", suggestedActions, "adminWarnings", warnings);
    }

    private List<String> missingFields(Map<String, Object> data) {
        return data.entrySet().stream()
                .filter(e -> !"recentRecords".equals(e.getKey()) && !"recordCount".equals(e.getKey()))
                .filter(e -> !filled(e.getValue()))
                .map(Map.Entry::getKey)
                .toList();
    }

    private Map<String, Object> activityFeedData(List<TimelineItemResponse> timeline) {
        return map(
                "items", timeline,
                "filters", List.of("ALL", "ACADEMIC", "ATTENDANCE", "FINANCE", "HEALTH", "BEHAVIOR", "DOCUMENT", "COMMUNICATION", "AI"),
                "hasMore", false,
                "nextCursor", null
        );
    }

    private List<Map<String, Object>> aiInsights(StudentEnrichmentProfile enrichment, int attendancePercent, long absent,
                                                 BigDecimal feeBalance, List<ExamResult> examResults,
                                                 List<StudentBehaviorRecord> behavior, List<StudentMedicalRecord> medical,
                                                 List<StudentAchievementRecord> achievements) {
        BigDecimal latestExam = examResults.isEmpty() ? null : examResults.get(0).getPercentage();
        return List.of(
                insight("Attendance trend analysis", severity(attendancePercent, 90, 75),
                        attendancePercent >= 90 ? "Attendance consistency is strong." : "Attendance needs closer monitoring.",
                        attendancePercent >= 90 ? "Maintain current routine." : "Schedule parent follow-up and daily check-ins.",
                        confidence(attendancePercent > 0), "ATTENDANCE"),
                insight("Subject weakness detection", latestExam != null && latestExam.compareTo(BigDecimal.valueOf(60)) < 0 ? "HIGH" : "LOW",
                        latestExam == null ? "No recent exam result is available yet." : "Latest exam percentage is " + latestExam + "%.",
                        "Review recent marks and collect teacher remarks for targeted remediation.",
                        confidence(latestExam != null), "ACADEMIC"),
                insight("Learning risk prediction", absent >= 5 || behavior.size() >= 2 ? "MEDIUM" : "LOW",
                        "Risk is inferred from attendance, behavior, finance, and profile completeness signals.",
                        "Create a short intervention note and review again after two weeks.",
                        74, "AI"),
                insight("Engagement score", achievements.isEmpty() ? "MEDIUM" : "LOW",
                        achievements.isEmpty() ? "No recent achievement or portfolio activity found." : "Recent achievements show positive engagement.",
                        achievements.isEmpty() ? "Invite the student into a club, competition, or portfolio activity." : "Showcase achievement in the portfolio.",
                        72, "ENGAGEMENT"),
                insight("Wellbeing review", medical.isEmpty() ? "LOW" : "MEDIUM",
                        medical.isEmpty() ? "No active medical records are present." : "Medical notes exist and should be reviewed before activities.",
                        "Keep emergency and doctor details current.",
                        68, "WELLBEING"),
                insight("Career recommendation", "LOW",
                        enrichment == null || enrichment.getCareerGoals() == null
                                ? "Career aspirations are not captured yet."
                                : "Career goal noted: " + enrichment.getCareerGoals(),
                        "Capture skills, certifications, and teacher recommendations for stronger guidance.",
                        63, "CAREER"),
                insight("Finance readiness", feeBalance.signum() > 0 ? "MEDIUM" : "LOW",
                        feeBalance.signum() > 0 ? "Outstanding fee balance may require follow-up." : "No outstanding fee balance detected.",
                        feeBalance.signum() > 0 ? "Coordinate finance office and parent communication." : "No finance intervention required.",
                        86, "FINANCE")
        );
    }

    private Map<String, Object> insight(String title, String severity, String summary,
                                        String recommendation, int confidence, String category) {
        return map("title", title, "severity", severity, "summary", summary,
                "recommendation", recommendation, "confidence", confidence, "category", category);
    }

    private int confidence(boolean hasSignal) {
        return hasSignal ? 82 : 48;
    }

    private String severity(int value, int strongThreshold, int watchThreshold) {
        if (value >= strongThreshold) return "LOW";
        if (value >= watchThreshold) return "MEDIUM";
        return value == 0 ? "INFO" : "HIGH";
    }

    private Map<String, Object> academicAnalytics(List<ExamResult> results, long assignmentCount, long homeworkCount) {
        List<Map<String, Object>> performanceTrend = results.stream().limit(8)
                .map(r -> map("label", r.getGeneratedAt(), "percentage", r.getPercentage(), "grade", r.getGrade(), "rank", r.getRank()))
                .toList();
        BigDecimal average = results.isEmpty() ? BigDecimal.ZERO : results.stream()
                .map(ExamResult::getPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(results.size()), 2, RoundingMode.HALF_UP);
        return map(
                "averagePercentage", average,
                "latestGrade", results.isEmpty() ? null : results.get(0).getGrade(),
                "latestRank", results.isEmpty() ? null : results.get(0).getRank(),
                "examReadinessScore", average.min(BigDecimal.valueOf(100)),
                "performanceTrend", performanceTrend,
                "subjectComparison", List.of(),
                "rankTrend", performanceTrend,
                "examHeatmap", performanceTrend,
                "monthlyProgress", performanceTrend,
                "assignmentCompletionPercent", assignmentCount == 0 ? 0 : 100,
                "homeworkSubmissionCount", homeworkCount,
                "teacherRemarks", results.stream().limit(3).map(r -> "Result " + r.getGrade() + " at " + r.getPercentage() + "%").toList()
        );
    }

    private Map<String, Object> healthWellbeing(Student student, StudentIdentityProfile identity, List<StudentMedicalRecord> medical) {
        return map(
                "bloodGroup", student.getBloodGroup(),
                "allergies", medicalRows(medical).stream().filter(r -> String.valueOf(r.get("conditionName")).toLowerCase().contains("allerg")).toList(),
                "medicalConditions", medicalRows(medical),
                "vaccinationRecords", List.of(),
                "emergencyContacts", List.of(map("name", identity == null ? null : identity.getEmergencyContactName(),
                        "phone", identity == null ? null : identity.getEmergencyContactPhone())),
                "doctorDetails", medical.stream().map(StudentMedicalRecord::getDoctorContact).filter(v -> v != null && !v.isBlank()).distinct().toList(),
                "mentalWellnessNotes", medical.stream().map(StudentMedicalRecord::getNotes).filter(v -> v != null && !v.isBlank()).limit(3).toList(),
                "physicalFitnessIndicators", List.of()
        );
    }

    private Map<String, Object> parentFamily(long parentCount, List<StudentCommunicationEvent> communications) {
        return map(
                "linkedParents", parentCount,
                "engagementScore", parentCount > 0 ? Math.min(100, 55 + communications.size() * 8) : 15,
                "communicationPreference", communications.isEmpty() ? null : communications.get(0).getChannel(),
                "pickupAuthorization", parentCount > 0 ? "Linked guardian required" : "Not configured",
                "emergencyContacts", parentCount,
                "activityHistory", communicationRows(communications),
                "occupation", null,
                "education", null,
                "incomeBracket", null
        );
    }

    private List<Map<String, Object>> riskProfile(int attendancePercent, long absent, BigDecimal feeBalance,
                                                  List<StudentBehaviorRecord> behavior, List<StudentMedicalRecord> medical,
                                                  List<ExamResult> results) {
        BigDecimal latestExam = results.isEmpty() ? BigDecimal.ZERO : results.get(0).getPercentage();
        return List.of(
                risk("Academic Risk", latestExam.compareTo(BigDecimal.valueOf(60)) < 0 && !results.isEmpty() ? "HIGH" : "LOW",
                        "Based on latest exam readiness and result trend.", "Teacher remediation and weekly progress review."),
                risk("Attendance Risk", attendancePercent > 0 && attendancePercent < 75 || absent >= 5 ? "HIGH" : "LOW",
                        "Based on attendance percentage and absence count.", "Parent call and attendance improvement plan."),
                risk("Behavioral Risk", behavior.size() >= 2 ? "MEDIUM" : "LOW",
                        "Based on recent behavior/counseling records.", "Counselor review and class teacher observation."),
                risk("Financial Risk", feeBalance.signum() > 0 ? "MEDIUM" : "LOW",
                        "Based on outstanding fee balance.", "Finance follow-up with family."),
                risk("Wellness Risk", medical.isEmpty() ? "LOW" : "MEDIUM",
                        "Based on medical records and wellbeing notes.", "Verify emergency contact and activity restrictions.")
        );
    }

    private Map<String, Object> risk(String label, String severity, String explanation, String intervention) {
        return map("label", label, "severity", severity, "explanation", explanation, "recommendedIntervention", intervention);
    }

    private Map<String, Object> documentVault(long documentCount) {
        return map(
                "documentCount", documentCount,
                "requiredTypes", List.of("AADHAAR_CARD", "TRANSFER_CERTIFICATE", "MARKSHEET", "FEE_RECEIPT", "CERTIFICATE", "MEDICAL_CERTIFICATE", "STUDENT_ID_CARD"),
                "expiryTrackingEnabled", false,
                "uploadHistoryAvailable", true,
                "previewSupported", true,
                "downloadSupported", true
        );
    }

    private Map<String, Object> communicationCenter(List<StudentCommunicationEvent> communications) {
        return map(
                "teacherNotes", communications.stream().filter(c -> "TEACHER_NOTE".equalsIgnoreCase(c.getChannel())).map(StudentCommunicationEvent::getSummary).toList(),
                "parentLogs", communicationRows(communications),
                "smsEmailHistory", communications.stream().filter(c -> "SMS".equalsIgnoreCase(c.getChannel()) || "EMAIL".equalsIgnoreCase(c.getChannel())).map(StudentCommunicationEvent::getSubject).toList(),
                "notifications", communications.size(),
                "meetingSummaries", communications.stream().filter(c -> String.valueOf(c.getSubject()).toLowerCase().contains("meeting")).map(StudentCommunicationEvent::getSummary).toList(),
                "aiSummary", communications.isEmpty() ? "No communication history available yet." : "Recent communication activity is available for review."
        );
    }

    private ProfileSectionResponse section(String key, String title, String description, String visibility,
                                           boolean editable, Map<String, Object> data,
                                           List<TimelineItemResponse> timeline) {
        return new ProfileSectionResponse(key, title, description, visibility, editable, completion(data), data, timeline);
    }

    private int completion(Map<String, Object> data) {
        if (data.isEmpty()) return 0;
        long filled = data.values().stream().filter(this::filled).count();
        return (int) Math.round((filled * 100.0) / data.size());
    }

    private boolean filled(Object value) {
        if (value == null) return false;
        if (value instanceof String s) return !s.isBlank();
        if (value instanceof Number n) return n.doubleValue() > 0;
        if (value instanceof List<?> list) return !list.isEmpty();
        return true;
    }

    private Student findStudent(UUID studentId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        return studentRepo.findByIdAndTenantId(studentId, tenantId)
                .orElseThrow(() -> new NotFoundException("Student not found: " + studentId));
    }

    private void updatePersonal(Student student, Map<String, Object> data) {
        String firstName = text(data, "firstName");
        String lastName = text(data, "lastName");
        if (firstName != null) student.setFirstName(firstName);
        if (lastName != null) student.setLastName(lastName);
        if (data.containsKey("dateOfBirth")) student.setDateOfBirth(date(data, "dateOfBirth"));
        if (data.containsKey("gender")) {
            String gender = text(data, "gender");
            student.setGender(gender == null ? null : Gender.valueOf(gender));
        }
        if (data.containsKey("bloodGroup")) student.setBloodGroup(text(data, "bloodGroup"));
        if (data.containsKey("photoUrl")) student.setPhotoUrl(text(data, "photoUrl"));
        studentRepo.save(student);
    }

    private void updateContact(Student student, Map<String, Object> data) {
        if (data.containsKey("phone")) student.setPhone(text(data, "phone"));
        if (data.containsKey("address")) student.setAddress(text(data, "address"));
        studentRepo.save(student);
        updateIdentity(student, data);
    }

    private void updateIdentity(Student student, Map<String, Object> data) {
        StudentIdentityProfile p = identityRepo.findByStudentId(student.getId())
                .orElseGet(() -> StudentIdentityProfile.create(student.getTenantId(), student.getSchoolId(), student.getId()));
        if (data.containsKey("governmentIdType")) p.setGovernmentIdType(text(data, "governmentIdType"));
        if (data.containsKey("governmentIdNumber")) p.setGovernmentIdNumber(text(data, "governmentIdNumber"));
        if (data.containsKey("nationality")) p.setNationality(text(data, "nationality"));
        if (data.containsKey("religion")) p.setReligion(text(data, "religion"));
        if (data.containsKey("casteCategory")) p.setCasteCategory(text(data, "casteCategory"));
        if (data.containsKey("motherTongue")) p.setMotherTongue(text(data, "motherTongue"));
        if (data.containsKey("previousSchool")) p.setPreviousSchool(text(data, "previousSchool"));
        if (data.containsKey("enrollmentSource")) p.setEnrollmentSource(text(data, "enrollmentSource"));
        if (data.containsKey("emergencyContactName")) p.setEmergencyContactName(text(data, "emergencyContactName"));
        if (data.containsKey("emergencyContactPhone")) p.setEmergencyContactPhone(text(data, "emergencyContactPhone"));
        identityRepo.save(p);
    }

    private void updateEnrichment(Student student, Map<String, Object> data) {
        StudentEnrichmentProfile p = enrichmentRepo.findByStudentId(student.getId())
                .orElseGet(() -> StudentEnrichmentProfile.create(student.getTenantId(), student.getSchoolId(), student.getId()));
        if (data.containsKey("interests")) p.setInterests(text(data, "interests"));
        if (data.containsKey("hobbies")) p.setHobbies(text(data, "hobbies"));
        if (data.containsKey("likes")) p.setLikes(text(data, "likes"));
        if (data.containsKey("dislikes")) p.setDislikes(text(data, "dislikes"));
        if (data.containsKey("skills")) p.setSkills(text(data, "skills"));
        if (data.containsKey("careerGoals")) p.setCareerGoals(text(data, "careerGoals"));
        if (data.containsKey("learningStyle")) p.setLearningStyle(text(data, "learningStyle"));
        if (data.containsKey("counselingSummary")) p.setCounselingSummary(text(data, "counselingSummary"));
        if (data.containsKey("aiRiskLevel")) p.setAiRiskLevel(text(data, "aiRiskLevel"));
        if (data.containsKey("aiInsights")) p.setAiInsights(text(data, "aiInsights"));
        enrichmentRepo.save(p);
    }

    private void updateLogistics(Student student, Map<String, Object> data) {
        StudentLogisticsProfile p = logisticsRepo.findByStudentId(student.getId())
                .orElseGet(() -> StudentLogisticsProfile.create(student.getTenantId(), student.getSchoolId(), student.getId()));
        if (data.containsKey("transportMode")) p.setTransportMode(text(data, "transportMode"));
        if (data.containsKey("routeName")) p.setRouteName(text(data, "routeName"));
        if (data.containsKey("pickupPoint")) p.setPickupPoint(text(data, "pickupPoint"));
        if (data.containsKey("dropPoint")) p.setDropPoint(text(data, "dropPoint"));
        if (data.containsKey("hostelName")) p.setHostelName(text(data, "hostelName"));
        if (data.containsKey("roomNumber")) p.setRoomNumber(text(data, "roomNumber"));
        if (data.containsKey("wardenContact")) p.setWardenContact(text(data, "wardenContact"));
        logisticsRepo.save(p);
    }

    private void addMedicalRecord(Student student, Map<String, Object> data) {
        String condition = requiredText(data, "conditionName");
        StudentMedicalRecord r = StudentMedicalRecord.create(student.getTenantId(), student.getSchoolId(), student.getId());
        r.setConditionName(condition);
        r.setSeverity(text(data, "severity"));
        r.setMedication(text(data, "medication"));
        r.setDoctorContact(text(data, "doctorContact"));
        r.setNotes(text(data, "notes"));
        medicalRepo.save(r);
    }

    private void addBehaviorRecord(Student student, Map<String, Object> data) {
        StudentBehaviorRecord r = StudentBehaviorRecord.create(student.getTenantId(), student.getSchoolId(), student.getId());
        r.setCategory(requiredText(data, "category"));
        r.setSeverity(text(data, "severity"));
        r.setSummary(requiredText(data, "summary"));
        r.setActionTaken(text(data, "actionTaken"));
        r.setCounselorNotes(text(data, "counselorNotes"));
        behaviorRepo.save(r);
        updateEnrichment(student, data);
    }

    private void addAchievement(Student student, Map<String, Object> data) {
        StudentAchievementRecord r = StudentAchievementRecord.create(student.getTenantId(), student.getSchoolId(), student.getId());
        r.setTitle(requiredText(data, "title"));
        r.setCategory(text(data, "category"));
        r.setDescription(text(data, "description"));
        r.setAwardedOn(date(data, "awardedOn"));
        r.setEvidenceUrl(text(data, "evidenceUrl"));
        achievementRepo.save(r);
    }

    private void addCommunication(Student student, Map<String, Object> data) {
        StudentCommunicationEvent e = StudentCommunicationEvent.create(student.getTenantId(), student.getSchoolId(), student.getId());
        e.setChannel(requiredText(data, "channel"));
        e.setDirection(value(text(data, "direction"), "OUTBOUND"));
        e.setSubject(requiredText(data, "subject"));
        e.setSummary(text(data, "summary"));
        communicationRepo.save(e);
    }

    private Map<String, Object> personalData(Student s) {
        return map("firstName", s.getFirstName(), "lastName", s.getLastName(), "studentNumber", s.getStudentNumber(),
                "admissionDate", s.getAdmissionDate(), "dateOfBirth", s.getDateOfBirth(), "gender", s.getGender(),
                "bloodGroup", s.getBloodGroup(), "photoUrl", s.getPhotoUrl());
    }

    private Map<String, Object> identityData(StudentIdentityProfile p) {
        return map("governmentIdType", p == null ? null : p.getGovernmentIdType(),
                "governmentIdNumber", p == null ? null : p.getGovernmentIdNumber(),
                "nationality", p == null ? null : p.getNationality(),
                "religion", p == null ? null : p.getReligion(),
                "casteCategory", p == null ? null : p.getCasteCategory(),
                "motherTongue", p == null ? null : p.getMotherTongue(),
                "previousSchool", p == null ? null : p.getPreviousSchool(),
                "enrollmentSource", p == null ? null : p.getEnrollmentSource());
    }

    private Map<String, Object> contactData(Student s, StudentIdentityProfile p) {
        return map("phone", s.getPhone(), "address", s.getAddress(),
                "emergencyContactName", p == null ? null : p.getEmergencyContactName(),
                "emergencyContactPhone", p == null ? null : p.getEmergencyContactPhone());
    }

    private Map<String, Object> interestsData(StudentEnrichmentProfile p) {
        return map("interests", p == null ? null : p.getInterests(), "hobbies", p == null ? null : p.getHobbies(),
                "likes", p == null ? null : p.getLikes(), "dislikes", p == null ? null : p.getDislikes());
    }

    private Map<String, Object> skillsData(StudentEnrichmentProfile p) {
        return map("skills", p == null ? null : p.getSkills(), "careerGoals", p == null ? null : p.getCareerGoals(),
                "learningStyle", p == null ? null : p.getLearningStyle());
    }

    private Map<String, Object> logisticsData(StudentLogisticsProfile p) {
        return map("transportMode", p == null ? null : p.getTransportMode(), "routeName", p == null ? null : p.getRouteName(),
                "pickupPoint", p == null ? null : p.getPickupPoint(), "dropPoint", p == null ? null : p.getDropPoint(),
                "hostelName", p == null ? null : p.getHostelName(), "roomNumber", p == null ? null : p.getRoomNumber(),
                "wardenContact", p == null ? null : p.getWardenContact());
    }

    private Map<String, Object> aiData(StudentEnrichmentProfile p, int attendancePercent, BigDecimal feeBalance, long absent) {
        String risk = p == null ? null : p.getAiRiskLevel();
        if (risk == null || risk.isBlank()) {
            risk = attendancePercent > 0 && attendancePercent < 75 || feeBalance.signum() > 0 || absent >= 5 ? "WATCH" : "NORMAL";
        }
        return map("aiRiskLevel", risk, "aiInsights", p == null ? null : p.getAiInsights(),
                "attendanceSignal", attendancePercent < 75 && attendancePercent > 0 ? "LOW_ATTENDANCE" : "OK",
                "financeSignal", feeBalance.signum() > 0 ? "OUTSTANDING_BALANCE" : "OK");
    }

    private List<Map<String, Object>> medicalRows(List<StudentMedicalRecord> records) {
        return records.stream().map(r -> map("id", r.getId(), "conditionName", r.getConditionName(), "severity", r.getSeverity(),
                "medication", r.getMedication(), "doctorContact", r.getDoctorContact(), "notes", r.getNotes(), "recordedAt", r.getRecordedAt())).toList();
    }

    private List<Map<String, Object>> behaviorRows(List<StudentBehaviorRecord> records) {
        return records.stream().map(r -> map("id", r.getId(), "category", r.getCategory(), "severity", r.getSeverity(),
                "summary", r.getSummary(), "actionTaken", r.getActionTaken(), "counselorNotes", r.getCounselorNotes(), "recordedAt", r.getRecordedAt())).toList();
    }

    private List<Map<String, Object>> achievementRows(List<StudentAchievementRecord> records) {
        return records.stream().map(r -> map("id", r.getId(), "title", r.getTitle(), "category", r.getCategory(),
                "description", r.getDescription(), "awardedOn", r.getAwardedOn(), "evidenceUrl", r.getEvidenceUrl(), "createdAt", r.getCreatedAt())).toList();
    }

    private List<Map<String, Object>> communicationRows(List<StudentCommunicationEvent> events) {
        return events.stream().map(e -> map("id", e.getId(), "channel", e.getChannel(), "direction", e.getDirection(),
                "subject", e.getSubject(), "summary", e.getSummary(), "occurredAt", e.getOccurredAt())).toList();
    }

    private List<TimelineItemResponse> timeline(List<StudentMedicalRecord> medical, List<StudentBehaviorRecord> behavior,
                                                List<StudentAchievementRecord> achievements, List<StudentCommunicationEvent> communications,
                                                List<ExamResult> examResults,
                                                List<AssignmentSubmission> assignmentSubmissions,
                                                List<HomeworkSubmission> homeworkSubmissions,
                                                Student student) {
        List<TimelineItemResponse> items = new ArrayList<>();
        items.add(new TimelineItemResponse(student.getId().toString(), "ADMISSION", "Student admitted",
                student.getStudentNumber(), student.getCreatedAt(), "SCHOOL_ADMIN"));
        items.addAll(medicalTimeline(medical));
        items.addAll(behaviorTimeline(behavior));
        items.addAll(achievementTimeline(achievements));
        items.addAll(communicationTimeline(communications));
        items.addAll(examResults.stream().limit(5)
                .map(r -> new TimelineItemResponse(r.getId().toString(), "ACADEMIC", "Exam result generated",
                        "Grade " + r.getGrade() + " · " + r.getPercentage() + "%", r.getGeneratedAt(), "SCHOOL_ADMIN"))
                .toList());
        items.addAll(assignmentSubmissions.stream()
                .map(s -> new TimelineItemResponse(s.getId().toString(), "ASSIGNMENT", "Assignment activity",
                        s.getStatus().name(), value(s.getSubmittedAt(), s.getUpdatedAt()), "SCHOOL_ADMIN"))
                .toList());
        items.addAll(homeworkSubmissions.stream()
                .map(s -> new TimelineItemResponse(s.getId().toString(), "HOMEWORK", "Homework submitted",
                        s.getStatus().name(), s.getSubmittedAt(), "SCHOOL_ADMIN"))
                .toList());
        items.sort(Comparator.comparing(TimelineItemResponse::occurredAt).reversed());
        return items.stream().limit(12).toList();
    }

    private List<TimelineItemResponse> medicalTimeline(List<StudentMedicalRecord> records) {
        return records.stream().map(r -> new TimelineItemResponse(r.getId().toString(), "HEALTH", r.getConditionName(),
                value(r.getNotes(), "Medical record added"), r.getRecordedAt(), "HEALTH")).toList();
    }

    private List<TimelineItemResponse> behaviorTimeline(List<StudentBehaviorRecord> records) {
        return records.stream().map(r -> new TimelineItemResponse(r.getId().toString(), "BEHAVIOR", r.getCategory(),
                r.getSummary(), r.getRecordedAt(), "COUNSELOR")).toList();
    }

    private List<TimelineItemResponse> achievementTimeline(List<StudentAchievementRecord> records) {
        return records.stream().map(r -> new TimelineItemResponse(r.getId().toString(), "ACHIEVEMENT", r.getTitle(),
                value(r.getDescription(), "Achievement recorded"), r.getCreatedAt(), "SCHOOL_ADMIN")).toList();
    }

    private List<TimelineItemResponse> communicationTimeline(List<StudentCommunicationEvent> events) {
        return events.stream().map(e -> new TimelineItemResponse(e.getId().toString(), "COMMUNICATION", e.getSubject(),
                value(e.getSummary(), e.getChannel()), e.getOccurredAt(), "SCHOOL_ADMIN")).toList();
    }

    private String text(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) return null;
        String text = String.valueOf(value).trim();
        return text.isBlank() ? null : text;
    }

    private String requiredText(Map<String, Object> data, String key) {
        String value = text(data, key);
        if (value == null) throw new BadRequestException(key + " is required");
        return value;
    }

    private LocalDate date(Map<String, Object> data, String key) {
        String value = text(data, key);
        return value == null ? null : LocalDate.parse(value);
    }

    private String value(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private Instant value(Instant value, Instant fallback) {
        return value == null ? fallback : value;
    }

    private Map<String, Object> map(Object... entries) {
        Map<String, Object> out = new LinkedHashMap<>();
        for (int i = 0; i < entries.length; i += 2) {
            out.put(String.valueOf(entries[i]), entries[i + 1]);
        }
        return out;
    }
}
