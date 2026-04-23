package com.campuscloud.exam.service;

import com.campuscloud.exam.dto.ExamCreateRequest;
import com.campuscloud.exam.dto.ExamResponse;
import com.campuscloud.exam.dto.ExamResultCreateRequest;
import com.campuscloud.exam.dto.ExamResultResponse;

import java.util.List;
import java.util.UUID;

public interface ExamService {

    ExamResponse createExam(ExamCreateRequest request);

    List<ExamResponse> getExamsByClass(UUID classId);

    ExamResultResponse createExamResult(ExamResultCreateRequest request);

    List<ExamResultResponse> getExamResults(UUID examId);
}
