package com.cloudcampus.staff.profile.service;

import com.cloudcampus.assignment.entity.Assignment;
import com.cloudcampus.assignment.repository.AssignmentRepository;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.homework.entity.HomeworkAssignment;
import com.cloudcampus.homework.repository.HomeworkRepository;
import com.cloudcampus.leave.entity.LeaveRequest;
import com.cloudcampus.leave.repository.LeaveRequestRepository;
import com.cloudcampus.lessonplan.entity.LessonPlan;
import com.cloudcampus.lessonplan.repository.LessonPlanRepository;
import com.cloudcampus.onlineclass.entity.OnlineClass;
import com.cloudcampus.onlineclass.repository.OnlineClassRepository;
import com.cloudcampus.school.entity.Department;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.DepartmentRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.entity.StaffStatus;
import com.cloudcampus.staff.profile.dto.StaffProfile360Response;
import com.cloudcampus.staff.profile.dto.StaffProfileSectionResponse;
import com.cloudcampus.staff.profile.dto.StaffTimelineItemResponse;
import com.cloudcampus.staff.repository.StaffRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
class StaffProfile360ServiceImpl implements StaffProfile360Service {

    private static final PageRequest RECENT_FIVE = PageRequest.of(0, 5);

    private final StaffRepository staffRepo;
    private final DepartmentRepository departmentRepo;
    private final SchoolRepository schoolRepo;
    private final LeaveRequestRepository leaveRepo;
    private final AssignmentRepository assignmentRepo;
    private final HomeworkRepository homeworkRepo;
    private final LessonPlanRepository lessonPlanRepo;
    private final OnlineClassRepository onlineClassRepo;

    StaffProfile360ServiceImpl(StaffRepository staffRepo,
                               DepartmentRepository departmentRepo,
                               SchoolRepository schoolRepo,
                               LeaveRequestRepository leaveRepo,
                               AssignmentRepository assignmentRepo,
                               HomeworkRepository homeworkRepo,
                               LessonPlanRepository lessonPlanRepo,
                               OnlineClassRepository onlineClassRepo) {
        this.staffRepo = staffRepo;
        this.departmentRepo = departmentRepo;
        this.schoolRepo = schoolRepo;
        this.leaveRepo = leaveRepo;
        this.assignmentRepo = assignmentRepo;
        this.homeworkRepo = homeworkRepo;
        this.lessonPlanRepo = lessonPlanRepo;
        this.onlineClassRepo = onlineClassRepo;
    }

    @Override
    @Transactional(readOnly = true)
    public StaffProfile360Response getProfile(UUID staffId) {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        Staff staff = staffRepo.findByIdAndTenantId(staffId, tenantId)
                .orElseThrow(() -> new NotFoundException("Staff not found: " + staffId));

        School school = schoolRepo.findByIdFiltered(staff.getSchoolId()).orElse(null);
        Department department = staff.getDepartmentId() == null ? null
                : departmentRepo.findByIdAndTenantId(staff.getDepartmentId(), tenantId).orElse(null);

        UUID workOwnerId = value(staff.getUserId(), staff.getId());
        long assignmentCount = assignmentRepo.countBySchoolIdAndAssignedBy(staff.getSchoolId(), workOwnerId);
        long homeworkCount = homeworkRepo.countBySchoolIdAndAssignedBy(staff.getSchoolId(), workOwnerId);
        List<Assignment> assignments = assignmentRepo
                .findBySchoolIdAndAssignedByOrderByCreatedAtDesc(staff.getSchoolId(), workOwnerId, RECENT_FIVE)
                .getContent();
        List<HomeworkAssignment> homework = homeworkRepo
                .findBySchoolIdAndAssignedByOrderByCreatedAtDesc(staff.getSchoolId(), workOwnerId, RECENT_FIVE)
                .getContent();
        List<LeaveRequest> leaveRequests = leaveRepo
                .findFiltered(staff.getSchoolId(), null, staff.getId(), RECENT_FIVE)
                .getContent();
        long leaveCount = leaveRepo.findFiltered(staff.getSchoolId(), null, staff.getId(), PageRequest.of(0, 1))
                .getTotalElements();
        LocalDate today = LocalDate.now();
        List<LessonPlan> lessonPlans = lessonPlanRepo
                .findByStaffIdAndPlanDateBetweenOrderByPlanDateAscPeriodNumberAsc(
                        staff.getId(), today.minusDays(30), today.plusDays(30));
        List<OnlineClass> onlineClasses = onlineClassRepo
                .findByStaffIdAndScheduledAtBetweenOrderByScheduledAtAsc(
                        staff.getId(), today.minusDays(30).atStartOfDay().toInstant(ZoneOffset.UTC),
                        today.plusDays(30).plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC));

        int workloadScore = workloadScore(assignmentCount, homeworkCount, lessonPlans.size(), onlineClasses.size());
        int aiPerformanceScore = aiPerformanceScore(staff, assignmentCount, homeworkCount, leaveCount, lessonPlans.size());
        int completionPercent;
        List<StaffTimelineItemResponse> timeline = timeline(staff, assignments, homework, leaveRequests, lessonPlans, onlineClasses);
        List<StaffProfileSectionResponse> sections = sections(
                staff, department, school, assignmentCount, homeworkCount, leaveCount,
                lessonPlans.size(), onlineClasses.size(), workloadScore, aiPerformanceScore);
        completionPercent = (int) Math.round(sections.stream()
                .mapToInt(StaffProfileSectionResponse::completionPercent)
                .average()
                .orElse(0));

        Map<String, Object> quickStats = map(
                "aiPerformanceScore", aiPerformanceScore,
                "workloadScore", workloadScore,
                "assignments", assignmentCount,
                "homework", homeworkCount,
                "leaveRequests", leaveCount,
                "lessonPlans", lessonPlans.size(),
                "onlineClasses", onlineClasses.size(),
                "completionPercent", completionPercent
        );

        return new StaffProfile360Response(
                staff.getId(),
                completionPercent,
                sections,
                timeline,
                quickStats,
                headerData(staff, department, school, aiPerformanceScore, workloadScore, leaveCount),
                completionData(sections),
                activityFeedData(timeline),
                aiInsights(staff, assignmentCount, homeworkCount, leaveCount, workloadScore, aiPerformanceScore),
                performanceAnalytics(assignmentCount, homeworkCount, lessonPlans, onlineClasses, workloadScore),
                hrEmployment(staff, department, school),
                payrollFinance(staff),
                skillsDevelopment(staff),
                attendanceLeave(staff, leaveRequests, leaveCount),
                documentVault(),
                communicationCenter(staff),
                healthWellbeing(staff, workloadScore),
                riskProfile(staff, leaveCount, workloadScore, aiPerformanceScore),
                roleViews()
        );
    }

    private List<StaffProfileSectionResponse> sections(Staff staff, Department department, School school,
                                                       long assignmentCount, long homeworkCount, long leaveCount,
                                                       int lessonPlanCount, int onlineClassCount,
                                                       int workloadScore, int aiPerformanceScore) {
        List<StaffProfileSectionResponse> sections = new ArrayList<>();
        sections.add(section("personal", "Personal Details", "Core demographic profile and staff identity.", "SCHOOL_ADMIN", true,
                map("firstName", staff.getFirstName(), "lastName", staff.getLastName(), "dateOfBirth", staff.getDateOfBirth(),
                        "gender", staff.getGender(), "photoUrl", staff.getPhotoUrl()), List.of()));
        sections.add(section("identity", "Identity Verification", "Employee ID and verification metadata.", "HR", false,
                map("employeeNumber", staff.getEmployeeNumber(), "verificationStatus", "PENDING_DOCUMENT_REVIEW",
                        "userAccountLinked", staff.getUserId() != null), List.of()));
        sections.add(section("contact", "Contact & Address", "Phone, email, and residential address.", "SCHOOL_ADMIN", true,
                map("phone", staff.getPhone(), "email", staff.getEmail(), "address", staff.getAddress()), List.of()));
        sections.add(section("employment", "Employment Details", "Role, department, campus, manager, and employment lifecycle.", "HR", false,
                map("staffType", staff.getStaffType(), "status", staff.getStatus(), "department", department == null ? null : department.getName(),
                        "campus", school == null ? null : school.getName(), "joiningDate", staff.getJoiningDate(),
                        "experienceYears", experienceYears(staff), "reportingManager", null), List.of()));
        sections.add(section("qualification", "Qualification & Certifications", "Academic qualification, specialization, and certification summary.", "SCHOOL_ADMIN", true,
                map("qualification", staff.getQualification(), "specialization", staff.getSpecialization(),
                        "certifications", List.of(), "workshops", List.of()), List.of()));
        sections.add(section("payroll", "Payroll & Banking", "Restricted payroll readiness summary without exposing sensitive banking values.", "ACCOUNTANT", false,
                map("payrollStatus", "NOT_CONFIGURED", "salaryStructure", "Restricted", "bankDetails", "Role restricted",
                        "taxDetails", "Role restricted", "payslips", 0, "reimbursements", 0), List.of()));
        sections.add(section("attendance", "Attendance & Leave", "Leave activity, attendance readiness, and workforce consistency signals.", "SCHOOL_ADMIN", false,
                map("leaveRequests", leaveCount, "attendanceStreak", attendanceStreak(staff, leaveCount),
                        "lateLogins", 0, "overtimeHours", 0, "workFromHomeDays", 0), List.of()));
        sections.add(section("performance", "Performance Reviews", "Teaching workload, classroom contribution, and productivity signals.", "PRINCIPAL", false,
                map("assignmentsCreated", assignmentCount, "homeworkCreated", homeworkCount, "lessonPlans", lessonPlanCount,
                        "onlineClasses", onlineClassCount, "aiPerformanceScore", aiPerformanceScore), List.of()));
        sections.add(section("skills", "Skills & Expertise", "Teaching skills, leadership, languages, achievements, and career growth.", "SCHOOL_ADMIN", true,
                map("specialization", staff.getSpecialization(), "technicalSkills", tags(staff.getSpecialization()),
                        "teachingSkills", List.of("Classroom planning", "Student mentoring"), "leadership", staff.getStaffType().name().contains("PRINCIPAL"),
                        "careerGoals", null), List.of()));
        sections.add(section("communication", "Communication", "HR, principal, parent, meeting, notification, email, and SMS summary.", "SCHOOL_ADMIN", false,
                map("hrMessages", 0, "principalNotes", 0, "parentInteractions", 0,
                        "meetingHistory", List.of(), "aiSummary", "No communication events captured for this staff member yet."), List.of()));
        sections.add(section("documents", "Documents", "Secure document vault metadata and compliance readiness.", "HR", false,
                map("documentCount", 0, "requiredTypes", requiredDocumentTypes(), "expiryAlerts", 0,
                        "versionTracking", true), List.of()));
        sections.add(section("health", "Health & Emergency", "Emergency readiness, wellbeing, and burnout-support signals.", "HR", false,
                map("emergencyContacts", List.of(), "medicalConditions", List.of(), "wellnessScore", 100 - Math.max(0, workloadScore - 70),
                        "burnoutIndicator", burnoutSeverity(workloadScore), "counselingSupport", "Available"), List.of()));
        sections.add(section("ai", "AI Insights", "AI-assisted workforce intelligence and recommended HR actions.", "PRINCIPAL", false,
                map("aiPerformanceScore", aiPerformanceScore, "workloadScore", workloadScore,
                        "riskLevel", aggregateRisk(staff, leaveCount, workloadScore, aiPerformanceScore)), List.of()));
        return sections;
    }

    private Map<String, Object> headerData(Staff staff, Department department, School school,
                                           int aiPerformanceScore, int workloadScore, long leaveCount) {
        List<Map<String, Object>> badges = new ArrayList<>();
        if (aiPerformanceScore >= 85) badges.add(badge("Top Educator", "emerald"));
        if (leaveCount == 0 && staff.getStatus() == StaffStatus.ACTIVE) badges.add(badge("Attendance Champion", "green"));
        if (staff.getStaffType().name().contains("PRINCIPAL")) badges.add(badge("Department Head", "blue"));
        if (staff.getSpecialization() != null && !staff.getSpecialization().isBlank()) badges.add(badge("Olympiad Mentor", "amber"));
        if (workloadScore >= 65 && workloadScore <= 85) badges.add(badge("AI Innovation Leader", "violet"));
        if (badges.isEmpty()) badges.add(badge("Growth Ready", "slate"));

        return map(
                "photoUrl", staff.getPhotoUrl(),
                "fullName", staff.getFirstName() + " " + staff.getLastName(),
                "employeeId", staff.getEmployeeNumber(),
                "roleDesignation", staff.getStaffType(),
                "department", department == null ? null : department.getName(),
                "subjectSpecialization", staff.getSpecialization(),
                "employmentType", "FULL_TIME",
                "joiningDate", staff.getJoiningDate(),
                "experience", experienceYears(staff) + " yrs",
                "qualification", staff.getQualification(),
                "campus", school == null ? null : school.getName(),
                "reportingManager", null,
                "status", staff.getStatus(),
                "badges", badges,
                "aiPerformanceScore", aiPerformanceScore,
                "attendanceStreak", attendanceStreak(staff, leaveCount),
                "lastActive", staff.getUpdatedAt(),
                "payrollStatus", "NOT_CONFIGURED",
                "quickActions", List.of("Edit Profile", "Add HR Note", "Upload Document", "Review Leave")
        );
    }

    private Map<String, Object> completionData(List<StaffProfileSectionResponse> sections) {
        List<Map<String, Object>> sectionSummaries = sections.stream()
                .map(s -> map("key", s.key(), "title", s.title(), "completionPercent", s.completionPercent(),
                        "missingFields", missingFields(s.data())))
                .toList();
        List<String> missingFields = sectionSummaries.stream()
                .flatMap(s -> ((List<?>) s.get("missingFields")).stream())
                .map(String::valueOf)
                .limit(14)
                .toList();
        List<String> suggestedActions = sections.stream()
                .filter(s -> s.completionPercent() < 75)
                .map(s -> "Complete " + s.title())
                .limit(8)
                .toList();
        List<String> warnings = sections.stream()
                .filter(s -> s.completionPercent() < 40)
                .map(s -> s.title() + " needs HR review")
                .limit(6)
                .toList();
        return map("sections", sectionSummaries, "missingFields", missingFields,
                "suggestedActions", suggestedActions, "hrWarnings", warnings);
    }

    private List<Map<String, Object>> aiInsights(Staff staff, long assignmentCount, long homeworkCount, long leaveCount,
                                                 int workloadScore, int aiPerformanceScore) {
        return List.of(
                insight("Teaching effectiveness analysis", severity(aiPerformanceScore, 80, 60),
                        aiPerformanceScore >= 80 ? "Classroom contribution and planning signals are strong."
                                : "More classroom evidence is needed to assess effectiveness confidently.",
                        "Review class outcomes and collect structured student feedback.", confidence(assignmentCount + homeworkCount > 0), "PERFORMANCE"),
                insight("Student engagement score", assignmentCount + homeworkCount > 0 ? "LOW" : "INFO",
                        assignmentCount + homeworkCount > 0 ? "Recent assignment or homework activity exists."
                                : "No assignment/homework activity is linked to this staff account yet.",
                        "Link teacher user accounts consistently so activity analytics become richer.", 68, "ENGAGEMENT"),
                insight("Attendance consistency", leaveCount <= 1 && staff.getStatus() == StaffStatus.ACTIVE ? "LOW" : "MEDIUM",
                        "Leave activity and current employment status are used as the available consistency signal.",
                        "Add staff attendance records to unlock heatmaps and late-login intelligence.", 61, "ATTENDANCE"),
                insight("Workload analysis", workloadScore > 85 ? "HIGH" : workloadScore > 70 ? "MEDIUM" : "LOW",
                        "Workload is inferred from lesson plans, online classes, homework, and assignments.",
                        workloadScore > 85 ? "Rebalance duties or schedule a manager check-in." : "Maintain current workload cadence.", 74, "WORKLOAD"),
                insight("Burnout risk detection", burnoutSeverity(workloadScore),
                        "Burnout risk is estimated from workload intensity and leave trend.",
                        "Review timetable load, after-hours expectations, and support needs.", 70, "WELLBEING"),
                insight("Promotion readiness", aiPerformanceScore >= 85 ? "LOW" : "INFO",
                        aiPerformanceScore >= 85 ? "The staff member shows strong readiness signals."
                                : "Promotion readiness requires more performance review and achievement data.",
                        "Capture appraisal history, training milestones, and leadership evidence.", 57, "CAREER"),
                insight("Skill gap analysis", staff.getSpecialization() == null || staff.getSpecialization().isBlank() ? "MEDIUM" : "LOW",
                        staff.getSpecialization() == null || staff.getSpecialization().isBlank()
                                ? "Subject specialization is not captured."
                                : "Specialization is captured and can seed professional development tags.",
                        "Maintain certifications, workshops, and research records.", 64, "SKILLS"),
                insight("Training recommendations", "INFO",
                        "Recommendations are generated from role, workload, specialization, and missing profile data.",
                        "Assign classroom technology, assessment design, and wellbeing workshops.", 62, "TRAINING"),
                insight("AI productivity score", severity(aiPerformanceScore, 82, 60),
                        "AI productivity score combines profile readiness, workload contribution, and HR status.",
                        "Keep profile data current to improve confidence and recommendations.", confidence(true), "AI")
        );
    }

    private Map<String, Object> performanceAnalytics(long assignmentCount, long homeworkCount,
                                                     List<LessonPlan> lessonPlans, List<OnlineClass> onlineClasses,
                                                     int workloadScore) {
        List<Map<String, Object>> monthlyProductivity = List.of(
                map("label", "Assignments", "value", assignmentCount),
                map("label", "Homework", "value", homeworkCount),
                map("label", "Lesson Plans", "value", lessonPlans.size()),
                map("label", "Online Classes", "value", onlineClasses.size())
        );
        return map(
                "classPerformanceAnalytics", List.of(),
                "studentFeedbackScore", 0,
                "assignmentCompletionEfficiency", assignmentCount == 0 ? 0 : Math.min(100, 60 + assignmentCount * 5),
                "subjectWiseResults", List.of(),
                "attendanceAnalytics", List.of(),
                "performanceHeatmap", monthlyProductivity,
                "workloadDistribution", monthlyProductivity,
                "monthlyProductivity", monthlyProductivity,
                "goalAchievementTracking", List.of(map("label", "Teaching activity", "value", workloadScore))
        );
    }

    private Map<String, Object> hrEmployment(Staff staff, Department department, School school) {
        return map(
                "employmentHistory", List.of(map("title", "Joined school", "date", staff.getJoiningDate(), "status", staff.getStatus())),
                "promotionRecords", List.of(),
                "departmentTransferHistory", department == null ? List.of() : List.of(map("department", department.getName(), "date", staff.getJoiningDate())),
                "probationStatus", experienceYears(staff) >= 1 ? "CONFIRMED" : "UNDER_REVIEW",
                "contractDetails", "Not configured",
                "noticePeriod", "Not configured",
                "appraisalHistory", List.of(),
                "reportingHierarchy", List.of(),
                "workLocation", school == null ? null : school.getName()
        );
    }

    private Map<String, Object> payrollFinance(Staff staff) {
        return map(
                "salaryStructure", "Restricted",
                "bankDetails", "Masked until payroll module is configured",
                "taxDetails", "Restricted",
                "pfEsi", "Not configured",
                "bonusHistory", List.of(),
                "incrementHistory", List.of(),
                "payslips", List.of(),
                "reimbursementClaims", List.of(),
                "aiSalaryAnalytics", "Payroll records are not enabled for this staff profile yet.",
                "security", map("roleBasedAccess", true, "auditRequired", true, "sensitiveFieldsMasked", true)
        );
    }

    private Map<String, Object> skillsDevelopment(Staff staff) {
        return map(
                "technicalSkills", tags(staff.getSpecialization()),
                "teachingSkills", List.of("Lesson planning", "Assessment design", "Student mentoring"),
                "certifications", List.of(),
                "workshopsAttended", List.of(),
                "trainingPrograms", List.of(),
                "researchPapers", List.of(),
                "achievements", List.of(),
                "leadershipAbilities", staff.getStaffType().name().contains("PRINCIPAL") ? List.of("Academic leadership") : List.of(),
                "languagesKnown", List.of(),
                "careerGoals", null
        );
    }

    private Map<String, Object> attendanceLeave(Staff staff, List<LeaveRequest> leaveRequests, long leaveCount) {
        return map(
                "attendanceHeatmap", List.of(),
                "leaveAnalytics", leaveRequests.stream()
                        .map(l -> map("type", l.getLeaveType(), "status", l.getStatus(), "days", l.getTotalDays(),
                                "from", l.getStartDate(), "to", l.getEndDate()))
                        .toList(),
                "lateLoginTracking", 0,
                "overtimeTracking", 0,
                "workFromHomeTracking", 0,
                "leaveBalance", "Not configured",
                "aiAbsenteeismPrediction", leaveCount > 3 || staff.getStatus() == StaffStatus.ON_LEAVE ? "WATCH" : "LOW"
        );
    }

    private Map<String, Object> documentVault() {
        return map(
                "documentCount", 0,
                "requiredTypes", requiredDocumentTypes(),
                "uploadHistory", List.of(),
                "previewSupported", true,
                "downloadSupported", true,
                "expiryAlerts", List.of(),
                "versionTracking", true
        );
    }

    private Map<String, Object> communicationCenter(Staff staff) {
        return map(
                "hrCommunication", List.of(),
                "principalNotes", List.of(),
                "parentInteractions", List.of(),
                "meetingHistory", List.of(),
                "notificationLogs", List.of(),
                "emailSmsLogs", List.of(),
                "aiCommunicationSummary", staff.getEmail() == null || staff.getEmail().isBlank()
                        ? "Primary email is missing; communication tracking will be limited."
                        : "No communication events captured for this staff profile yet."
        );
    }

    private Map<String, Object> healthWellbeing(Staff staff, int workloadScore) {
        return map(
                "emergencyContacts", List.of(),
                "medicalConditions", List.of(),
                "wellnessTracking", List.of(map("label", "Burnout watch", "value", burnoutSeverity(workloadScore))),
                "burnoutIndicators", burnoutSeverity(workloadScore),
                "counselingSupport", "Available",
                "workStressAnalysis", workloadScore > 85 ? "High workload requires manager review." : "No critical workload stress signal."
        );
    }

    private List<Map<String, Object>> riskProfile(Staff staff, long leaveCount, int workloadScore, int aiPerformanceScore) {
        return List.of(
                risk("Performance Risk", aiPerformanceScore < 55 ? "HIGH" : aiPerformanceScore < 70 ? "MEDIUM" : "LOW",
                        "Based on AI performance score and current contribution signals.", "Schedule performance review and gather classroom evidence."),
                risk("Attendance Risk", leaveCount > 3 || staff.getStatus() == StaffStatus.ON_LEAVE ? "MEDIUM" : "LOW",
                        "Based on leave count and current status.", "Review leave trend and attendance records."),
                risk("Burnout Risk", burnoutSeverity(workloadScore),
                        "Based on workload score across academic duties.", "Balance timetable and schedule support check-in."),
                risk("Compliance Risk", "MEDIUM",
                        "Document vault does not yet contain required compliance files.", "Collect Aadhaar/PAN/contracts/certificates with audit trail."),
                risk("Financial Risk", "INFO",
                        "Payroll records are not configured in the current installation.", "Enable payroll module before exposing salary analytics.")
        );
    }

    private Map<String, Object> roleViews() {
        return map(
                "SUPER_ADMIN", List.of("Header", "Compliance", "AI Insights", "Risk"),
                "SCHOOL_ADMIN", List.of("Header", "Employment", "Performance", "Attendance", "Communication"),
                "HR", List.of("Header", "Employment", "Documents", "Health", "Risk"),
                "PRINCIPAL", List.of("Header", "Performance", "AI Insights", "Communication", "Risk"),
                "TEACHER", List.of("Header", "Skills", "Timeline", "Performance Summary"),
                "ACCOUNTANT", List.of("Header", "Payroll Summary", "Finance Risk"),
                "sensitiveFieldsMasked", true,
                "authLogicChanged", false
        );
    }

    private List<StaffTimelineItemResponse> timeline(Staff staff, List<Assignment> assignments,
                                                     List<HomeworkAssignment> homework,
                                                     List<LeaveRequest> leaveRequests,
                                                     List<LessonPlan> lessonPlans,
                                                     List<OnlineClass> onlineClasses) {
        List<StaffTimelineItemResponse> items = new ArrayList<>();
        items.add(new StaffTimelineItemResponse(staff.getId().toString(), "EMPLOYMENT", "Staff onboarded",
                staff.getEmployeeNumber(), toInstant(staff.getCreatedAt()), "SCHOOL_ADMIN"));
        items.addAll(assignments.stream().map(a -> new StaffTimelineItemResponse(a.getId().toString(), "ASSIGNMENT",
                "Assignment created", a.getTitle() + " · " + a.getStatus(), a.getCreatedAt(), "SCHOOL_ADMIN")).toList());
        items.addAll(homework.stream().map(h -> new StaffTimelineItemResponse(h.getId().toString(), "HOMEWORK",
                "Homework assigned", h.getTitle() + " · " + h.getStatus(), h.getCreatedAt(), "SCHOOL_ADMIN")).toList());
        items.addAll(leaveRequests.stream().map(l -> new StaffTimelineItemResponse(l.getId().toString(), "LEAVE",
                "Leave " + l.getStatus(), l.getLeaveType() + " · " + l.getTotalDays() + " day(s)", l.getCreatedAt(), "HR")).toList());
        items.addAll(lessonPlans.stream().limit(5).map(p -> new StaffTimelineItemResponse(p.getId().toString(), "LESSON_PLAN",
                "Lesson plan " + p.getStatus(), p.getTopic(), toInstant(p.getPlanDate()), "PRINCIPAL")).toList());
        items.addAll(onlineClasses.stream().limit(5).map(c -> new StaffTimelineItemResponse(c.getId().toString(), "ONLINE_CLASS",
                "Online class scheduled", c.getTitle(), c.getScheduledAt(), "SCHOOL_ADMIN")).toList());
        items.add(new StaffTimelineItemResponse("ai-" + staff.getId(), "AI", "AI performance alert generated",
                "Workforce intelligence profile refreshed.", Instant.now(), "PRINCIPAL"));
        items.sort(Comparator.comparing(StaffTimelineItemResponse::occurredAt).reversed());
        return items.stream().limit(14).toList();
    }

    private StaffProfileSectionResponse section(String key, String title, String description, String visibility,
                                                boolean editable, Map<String, Object> data,
                                                List<StaffTimelineItemResponse> timeline) {
        return new StaffProfileSectionResponse(key, title, description, visibility, editable, completion(data), data, timeline);
    }

    private int completion(Map<String, Object> data) {
        if (data.isEmpty()) return 0;
        long filled = data.values().stream().filter(this::filled).count();
        return (int) Math.round((filled * 100.0) / data.size());
    }

    private boolean filled(Object value) {
        if (value == null) return false;
        if (value instanceof String s) return !s.isBlank() && !"Not configured".equalsIgnoreCase(s) && !"Restricted".equalsIgnoreCase(s);
        if (value instanceof Number n) return n.doubleValue() > 0;
        if (value instanceof Boolean) return true;
        if (value instanceof List<?> list) return !list.isEmpty();
        return true;
    }

    private List<String> missingFields(Map<String, Object> data) {
        return data.entrySet().stream()
                .filter(e -> !"requiredTypes".equals(e.getKey()))
                .filter(e -> !filled(e.getValue()))
                .map(Map.Entry::getKey)
                .toList();
    }

    private Map<String, Object> activityFeedData(List<StaffTimelineItemResponse> timeline) {
        return map(
                "items", timeline,
                "filters", List.of("ALL", "ATTENDANCE", "LEAVE", "PAYROLL", "CLASS", "HOMEWORK", "EXAM", "TRAINING", "DOCUMENT", "COMMUNICATION", "AI"),
                "hasMore", false,
                "nextCursor", null
        );
    }

    private int workloadScore(long assignmentCount, long homeworkCount, int lessonPlanCount, int onlineClassCount) {
        long score = assignmentCount * 6 + homeworkCount * 4L + lessonPlanCount * 3L + onlineClassCount * 5L;
        return (int) Math.min(100, Math.max(20, score));
    }

    private int aiPerformanceScore(Staff staff, long assignmentCount, long homeworkCount, long leaveCount, int lessonPlanCount) {
        int base = staff.getStatus() == StaffStatus.ACTIVE ? 58 : 38;
        if (staff.getQualification() != null && !staff.getQualification().isBlank()) base += 8;
        if (staff.getSpecialization() != null && !staff.getSpecialization().isBlank()) base += 8;
        base += Math.min(18, (int) ((assignmentCount + homeworkCount + lessonPlanCount) * 3));
        base -= Math.min(12, (int) leaveCount * 2);
        return Math.min(100, Math.max(0, base));
    }

    private int experienceYears(Staff staff) {
        if (staff.getJoiningDate() == null) return 0;
        return (int) Math.max(0, ChronoUnit.YEARS.between(staff.getJoiningDate(), LocalDate.now()));
    }

    private String attendanceStreak(Staff staff, long leaveCount) {
        if (staff.getStatus() == StaffStatus.ON_LEAVE) return "Currently on leave";
        if (staff.getStatus() != StaffStatus.ACTIVE) return "Inactive";
        if (leaveCount == 0) return "Excellent";
        if (leaveCount <= 2) return "Stable";
        return "Needs review";
    }

    private String aggregateRisk(Staff staff, long leaveCount, int workloadScore, int aiPerformanceScore) {
        if (staff.getStatus() == StaffStatus.TERMINATED || staff.getStatus() == StaffStatus.RESIGNED) return "HIGH";
        if (workloadScore > 85 || aiPerformanceScore < 55 || leaveCount > 4) return "WATCH";
        return "NORMAL";
    }

    private String severity(int value, int strongThreshold, int watchThreshold) {
        if (value >= strongThreshold) return "LOW";
        if (value >= watchThreshold) return "MEDIUM";
        return value == 0 ? "INFO" : "HIGH";
    }

    private String burnoutSeverity(int workloadScore) {
        if (workloadScore > 85) return "HIGH";
        if (workloadScore > 70) return "MEDIUM";
        return "LOW";
    }

    private int confidence(boolean hasSignal) {
        return hasSignal ? 82 : 48;
    }

    private Map<String, Object> insight(String title, String severity, String summary,
                                        String recommendation, int confidence, String category) {
        return map("title", title, "severity", severity, "summary", summary,
                "recommendation", recommendation, "confidence", confidence, "category", category);
    }

    private Map<String, Object> risk(String label, String severity, String explanation, String action) {
        return map("label", label, "severity", severity, "explanation", explanation, "suggestedHrAction", action);
    }

    private Map<String, Object> badge(String label, String tone) {
        return map("label", label, "tone", tone);
    }

    private List<String> requiredDocumentTypes() {
        return List.of("AADHAAR", "PAN", "CONTRACT", "CERTIFICATE", "JOINING_LETTER", "EXPERIENCE_LETTER", "PAYSLIP", "ID_CARD", "COMPLIANCE_DOC");
    }

    private List<String> tags(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        return List.of(raw.split(",")).stream().map(String::trim).filter(s -> !s.isBlank()).limit(8).toList();
    }

    private Instant toInstant(LocalDate date) {
        return date == null ? Instant.now() : date.atStartOfDay().toInstant(ZoneOffset.UTC);
    }

    private Instant toInstant(Instant instant) {
        return instant == null ? Instant.now() : instant;
    }

    @SafeVarargs
    private <T> T value(T... candidates) {
        for (T candidate : candidates) {
            if (candidate != null) return candidate;
        }
        return null;
    }

    private Map<String, Object> map(Object... values) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i < values.length; i += 2) {
            map.put(String.valueOf(values[i]), values[i + 1]);
        }
        return map;
    }
}
