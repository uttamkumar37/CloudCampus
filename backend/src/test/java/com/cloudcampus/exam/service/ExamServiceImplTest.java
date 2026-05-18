package com.cloudcampus.exam.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.exam.dto.ExamCreateRequest;
import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamType;
import com.cloudcampus.exam.repository.ExamRepository;
import com.cloudcampus.exam.repository.ExamSubjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExamServiceImplTest {

    @Mock ExamRepository        examRepository;
    @Mock ExamSubjectRepository examSubjectRepository;

    @InjectMocks ExamServiceImpl service;

    private static final UUID TENANT_A = UUID.randomUUID();
    private static final UUID SCHOOL_A = UUID.randomUUID();
    private static final UUID SCHOOL_B = UUID.randomUUID();
    private static final UUID YEAR_ID  = UUID.randomUUID();

    private static final LocalDate START = LocalDate.of(2025, 3, 1);
    private static final LocalDate END   = LocalDate.of(2025, 3, 10);

    private Exam buildExam(UUID schoolId) {
        Exam exam = Exam.create(
                TENANT_A, schoolId, YEAR_ID,
                "Mid-Term", ExamType.MIDTERM,
                START, END,
                new BigDecimal("100"), new BigDecimal("35")
        );
        ReflectionTestUtils.setField(exam, "id", UUID.randomUUID());
        return exam;
    }

    // ── getById — happy path ──────────────────────────────────────────────────

    @Test
    void getById_whenCorrectSchool_returnsExam() {
        Exam exam   = buildExam(SCHOOL_A);
        UUID examId = exam.getId();

        when(examRepository.findByIdAndSchoolId(examId, SCHOOL_A)).thenReturn(Optional.of(exam));
        when(examSubjectRepository.findByExamIdOrderByExamDateAsc(examId)).thenReturn(List.of());

        var response = service.getById(SCHOOL_A, examId);

        assertThat(response.id()).isEqualTo(examId);
        assertThat(response.schoolId()).isEqualTo(SCHOOL_A);
    }

    // ── H-26: tenant isolation — cross-school ID must not reveal another school's exam ─

    @Test
    void getById_whenWrongSchool_throwsNotFoundException() {
        Exam examOwnedBySchoolA = buildExam(SCHOOL_A);
        UUID examId             = examOwnedBySchoolA.getId();

        // Repository enforces schoolId filter; a different school sees nothing.
        when(examRepository.findByIdAndSchoolId(examId, SCHOOL_B)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(SCHOOL_B, examId))
                .isInstanceOf(NotFoundException.class);

        verify(examSubjectRepository, never()).findByExamIdOrderByExamDateAsc(any());
    }

    // ── create — input validation guards ─────────────────────────────────────

    @Test
    void create_whenEndDateBeforeStartDate_throwsBadRequest() {
        var req = new ExamCreateRequest(
                YEAR_ID, "Final", ExamType.TERM,
                LocalDate.of(2025, 5, 10), LocalDate.of(2025, 5, 5),
                new BigDecimal("100"), new BigDecimal("40"),
                null, null
        );

        assertThatThrownBy(() -> service.create(TENANT_A, SCHOOL_A, req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("End date");
    }

    @Test
    void create_whenPassingMarksExceedTotalMarks_throwsBadRequest() {
        var req = new ExamCreateRequest(
                YEAR_ID, "Final", ExamType.TERM,
                START, END,
                new BigDecimal("50"), new BigDecimal("60"),
                null, null
        );

        assertThatThrownBy(() -> service.create(TENANT_A, SCHOOL_A, req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Passing marks");
    }
}
