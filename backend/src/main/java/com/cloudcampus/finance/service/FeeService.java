package com.cloudcampus.finance.service;

import com.cloudcampus.finance.dto.CreateFeeCategoryRequest;
import com.cloudcampus.finance.dto.CreateFeeStructureRequest;
import com.cloudcampus.finance.dto.CreateStudentFeeRecordRequest;
import com.cloudcampus.finance.dto.FeeCategoryResponse;
import com.cloudcampus.finance.dto.FeePaymentResponse;
import com.cloudcampus.finance.dto.FeeReceiptResponse;
import com.cloudcampus.finance.dto.FeeStructureResponse;
import com.cloudcampus.finance.dto.RecordPaymentRequest;
import com.cloudcampus.finance.dto.StudentFeeRecordResponse;
import com.cloudcampus.finance.entity.FeeStatus;

import java.util.List;
import java.util.UUID;

public interface FeeService {

    // ── Fee Categories ──────────────────────────────────────────────────────

    FeeCategoryResponse createCategory(UUID schoolId, CreateFeeCategoryRequest request);

    List<FeeCategoryResponse> listCategories(UUID schoolId, boolean activeOnly);

    FeeCategoryResponse deactivateCategory(UUID categoryId);

    // ── Fee Structures ──────────────────────────────────────────────────────

    FeeStructureResponse createStructure(UUID schoolId, CreateFeeStructureRequest request);

    List<FeeStructureResponse> listStructures(UUID schoolId, UUID academicYearId);

    // ── Student Fee Records ─────────────────────────────────────────────────

    StudentFeeRecordResponse createRecord(UUID schoolId, CreateStudentFeeRecordRequest request);

    List<StudentFeeRecordResponse> listRecordsByStudent(UUID studentId, UUID academicYearId);

    List<StudentFeeRecordResponse> listRecordsBySchool(UUID schoolId, UUID academicYearId,
                                                       FeeStatus status);

    StudentFeeRecordResponse getRecord(UUID recordId);

    StudentFeeRecordResponse waiveRecord(UUID recordId);

    // ── Payments ────────────────────────────────────────────────────────────

    FeePaymentResponse recordPayment(UUID recordId, RecordPaymentRequest request);

    // ── Receipt ─────────────────────────────────────────────────────────────

    FeeReceiptResponse getReceipt(UUID recordId);
}
