import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { FeeAssignment, FeePayment, RecordPaymentRequest } from '../types/fees';

export async function getStudentFeeAssignments(
  studentId: string,
): Promise<FeeAssignment[]> {
  const { data } = await apiClient.get<ApiResponse<FeeAssignment[]>>(
    `/fees/students/${studentId}/assignments`,
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function recordPayment(
  payload: RecordPaymentRequest,
): Promise<FeePayment> {
  const { data } = await apiClient.post<ApiResponse<FeePayment>>(
    '/fees/payments',
    payload,
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}
