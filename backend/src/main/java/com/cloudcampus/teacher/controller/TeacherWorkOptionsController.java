package com.cloudcampus.teacher.controller;

import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.school.dto.AcademicYearResponse;
import com.cloudcampus.school.dto.ClassRoomResponse;
import com.cloudcampus.school.dto.SectionResponse;
import com.cloudcampus.school.dto.SubjectResponse;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.ClassRoomRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.school.repository.SectionRepository;
import com.cloudcampus.school.repository.SubjectRepository;
import com.cloudcampus.staff.entity.Staff;
import com.cloudcampus.staff.repository.StaffRepository;
import com.cloudcampus.staff.service.StaffAssignmentService;
import com.cloudcampus.timetable.entity.TimetableSlot;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/teacher/work-options")
@PreAuthorize("hasRole('TEACHER')")
@Tag(name = "Teacher — Work Options", description = "Teacher reference data for homework and assignment creation")
public class TeacherWorkOptionsController {

    public record TeacherWorkOptions(
            List<AcademicYearResponse> academicYears,
            List<ClassRoomResponse> classes,
            List<SectionResponse> sections,
            List<SubjectResponse> subjects
    ) {}

    private final SchoolRepository schoolRepo;
    private final AcademicYearRepository academicYearRepo;
    private final ClassRoomRepository classRoomRepo;
    private final SectionRepository sectionRepo;
    private final SubjectRepository subjectRepo;
    private final StaffRepository staffRepo;
    private final StaffAssignmentService staffAssignmentService;

    public TeacherWorkOptionsController(
            SchoolRepository schoolRepo,
            AcademicYearRepository academicYearRepo,
            ClassRoomRepository classRoomRepo,
            SectionRepository sectionRepo,
            SubjectRepository subjectRepo,
            StaffRepository staffRepo,
            StaffAssignmentService staffAssignmentService) {
        this.schoolRepo = schoolRepo;
        this.academicYearRepo = academicYearRepo;
        this.classRoomRepo = classRoomRepo;
        this.sectionRepo = sectionRepo;
        this.subjectRepo = subjectRepo;
        this.staffRepo = staffRepo;
        this.staffAssignmentService = staffAssignmentService;
    }

    @Operation(summary = "List teacher-scoped academic years, classes, sections and subjects")
    @GetMapping
    public ApiResponse<TeacherWorkOptions> options() {
        UUID tenantId = UUID.fromString(RequestContext.getTenantId());
        School school = resolveSchool(tenantId);
        Staff staff = resolveTeacherStaff(school.getId());
        List<TimetableSlot> assignedSlots = staffAssignmentService.listAssignedSlots(school.getId(), staff.getId());
        Set<UUID> academicYearIds = assignedSlots.stream().map(TimetableSlot::getAcademicYearId).collect(Collectors.toSet());
        Set<UUID> classIds = assignedSlots.stream().map(TimetableSlot::getClassId).collect(Collectors.toSet());
        Set<UUID> sectionIds = assignedSlots.stream().map(TimetableSlot::getSectionId).collect(Collectors.toSet());
        Set<UUID> subjectIds = assignedSlots.stream().map(TimetableSlot::getSubjectId).collect(Collectors.toSet());

        TeacherWorkOptions options = new TeacherWorkOptions(
                academicYearRepo.findAllBySchoolIdOrderByStartDateDesc(school.getId())
                        .stream().filter(y -> academicYearIds.contains(y.getId())).map(AcademicYearResponse::from).toList(),
                classRoomRepo.findAllBySchoolIdAndTenantIdOrderByGradeOrderAscNameAsc(school.getId(), tenantId)
                        .stream().filter(c -> classIds.contains(c.getId())).map(ClassRoomResponse::from).toList(),
                sectionRepo.findAllBySchoolIdOrderByNameAsc(school.getId())
                        .stream().filter(s -> sectionIds.contains(s.getId())).map(SectionResponse::from).toList(),
                subjectRepo.findAllBySchoolIdAndIsActiveOrderByNameAsc(school.getId(), true)
                        .stream().filter(s -> subjectIds.contains(s.getId())).map(SubjectResponse::from).toList()
        );
        return ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), options);
    }

    private School resolveSchool(UUID tenantId) {
        String schoolId = RequestContext.getSchoolId();
        if (schoolId != null && !schoolId.isBlank()) {
            return schoolRepo.findByIdFiltered(UUID.fromString(schoolId))
                    .filter(s -> s.getTenantId().equals(tenantId))
                    .orElseThrow(() -> new NotFoundException("School not found"));
        }
        return schoolRepo.findByTenantIdAndCode(tenantId, "MAIN")
                .orElseThrow(() -> new NotFoundException("School not found"));
    }

    private Staff resolveTeacherStaff(UUID schoolId) {
        return staffRepo.findBySchoolIdAndUserId(schoolId, RequestContext.getUserId())
                .orElseThrow(() -> new NotFoundException("Teacher staff profile not found"));
    }
}
