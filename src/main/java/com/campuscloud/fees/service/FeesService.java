package com.campuscloud.fees.service;

import com.campuscloud.fees.dto.FeeAssignmentCreateRequest;
import com.campuscloud.fees.dto.FeeAssignmentResponse;
import com.campuscloud.fees.dto.FeePaymentCreateRequest;
import com.campuscloud.fees.dto.FeePaymentResponse;

import java.util.List;
import java.util.UUID;

public interface FeesService {

    FeeAssignmentResponse createFeeAssignment(FeeAssignmentCreateRequest request);

    FeePaymentResponse recordFeePayment(FeePaymentCreateRequest request);

    List<FeeAssignmentResponse> getFeeAssignmentsByStudent(UUID studentId);
}
