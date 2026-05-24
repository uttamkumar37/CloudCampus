package com.cloudcampus.mobile.service;

import com.cloudcampus.attendance.repository.AttendanceRecordRepository;
import com.cloudcampus.common.web.RequestContext;
import com.cloudcampus.exam.entity.ExamStatus;
import com.cloudcampus.exam.repository.ExamResultRepository;
import com.cloudcampus.finance.service.FeeService;
import com.cloudcampus.homework.repository.HomeworkRepository;
import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.entity.SchoolStatus;
import com.cloudcampus.school.repository.AcademicYearRepository;
import com.cloudcampus.school.repository.SchoolRepository;
import com.cloudcampus.student.entity.Student;
import com.cloudcampus.student.repository.StudentParentLinkRepository;
import com.cloudcampus.student.repository.StudentRepository;
import com.cloudcampus.timetable.service.TimetableService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ParentPortalServiceImplTest {

    private static final UUID TENANT_ID = UUID.randomUUID();
    private static final UUID PARENT_USER_ID = UUID.randomUUID();
    private static final UUID STUDENT_ID = UUID.randomUUID();
    private static final UUID BRANCH_SCHOOL_ID = UUID.randomUUID();
    private static final UUID CLASS_ID = UUID.randomUUID();
    private static final UUID SECTION_ID = UUID.randomUUID();
    private static final UUID ACADEMIC_YEAR_ID = UUID.randomUUID();

    @Mock StudentParentLinkRepository linkRepo;
    @Mock StudentRepository studentRepo;
    @Mock AttendanceRecordRepository attendanceRepo;
    @Mock ExamResultRepository resultRepo;
    @Mock HomeworkRepository homeworkRepo;
    @Mock TimetableService timetableService;
    @Mock AcademicYearRepository academicYearRepo;
    @Mock SchoolRepository schoolRepo;
    @Mock FeeService feeService;

    ParentPortalServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ParentPortalServiceImpl(
                linkRepo,
                studentRepo,
                attendanceRepo,
                resultRepo,
                homeworkRepo,
                timetableService,
                academicYearRepo,
                schoolRepo,
                feeService);
    }

    @Test
    void getChildResults_usesLinkedStudentsActualSchoolAndCompletedExamsOnly() {
        Student branchStudent = branchStudent();
        stubParentAccess(branchStudent);
        when(schoolRepo.findByIdFiltered(BRANCH_SCHOOL_ID)).thenReturn(Optional.of(branchSchool()));
        when(resultRepo.findByStudentIdAndSchoolIdAndExamStatusOrderByCreatedAtDesc(
                STUDENT_ID, BRANCH_SCHOOL_ID, ExamStatus.COMPLETED))
                .thenReturn(List.of());

        try (MockedStatic<RequestContext> ctx = parentContext()) {
            service.getChildResults(STUDENT_ID);
        }

        verify(schoolRepo).findByIdFiltered(BRANCH_SCHOOL_ID);
        verify(schoolRepo, never()).findByTenantIdAndCode(TENANT_ID, "MAIN");
        verify(resultRepo).findByStudentIdAndSchoolIdAndExamStatusOrderByCreatedAtDesc(
                STUDENT_ID, BRANCH_SCHOOL_ID, ExamStatus.COMPLETED);
        verify(resultRepo, never()).findByStudentIdAndSchoolIdOrderByCreatedAtDesc(
                STUDENT_ID, BRANCH_SCHOOL_ID);
    }

    @Test
    void getChildTimetable_usesLinkedStudentsActualSchool() {
        Student branchStudent = branchStudent();
        stubParentAccess(branchStudent);
        when(schoolRepo.findByIdFiltered(BRANCH_SCHOOL_ID)).thenReturn(Optional.of(branchSchool()));
        when(timetableService.listSlots(BRANCH_SCHOOL_ID, ACADEMIC_YEAR_ID, CLASS_ID, SECTION_ID))
                .thenReturn(List.of());

        try (MockedStatic<RequestContext> ctx = parentContext()) {
            service.getChildTimetable(STUDENT_ID, ACADEMIC_YEAR_ID);
        }

        verify(schoolRepo).findByIdFiltered(BRANCH_SCHOOL_ID);
        verify(schoolRepo, never()).findByTenantIdAndCode(TENANT_ID, "MAIN");
        verify(timetableService).listSlots(BRANCH_SCHOOL_ID, ACADEMIC_YEAR_ID, CLASS_ID, SECTION_ID);
    }

    private void stubParentAccess(Student student) {
        when(linkRepo.existsByStudentIdAndParentUserId(STUDENT_ID, PARENT_USER_ID)).thenReturn(true);
        when(studentRepo.findByIdAndTenantId(STUDENT_ID, TENANT_ID)).thenReturn(Optional.of(student));
    }

    private Student branchStudent() {
        Student student = Student.create(
                TENANT_ID,
                BRANCH_SCHOOL_ID,
                "BR-001",
                "Branch",
                "Student",
                LocalDate.now());
        student.setClassId(CLASS_ID);
        student.setSectionId(SECTION_ID);
        return student;
    }

    private School branchSchool() {
        return new School(
                BRANCH_SCHOOL_ID,
                TENANT_ID,
                "Branch School",
                "BRANCH",
                SchoolStatus.ACTIVE,
                Instant.now());
    }

    private MockedStatic<RequestContext> parentContext() {
        MockedStatic<RequestContext> ctx = mockStatic(RequestContext.class);
        ctx.when(RequestContext::getTenantId).thenReturn(TENANT_ID.toString());
        ctx.when(RequestContext::getUserId).thenReturn(PARENT_USER_ID);
        return ctx;
    }
}
