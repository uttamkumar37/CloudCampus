import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import type {
  CreateFeeCategoryRequest,
  CreateFeeStructureRequest,
  CreateStudentFeeRecordRequest,
  FeeCategoryResponse,
  FeePaymentResponse,
  FeeReceiptResponse,
  FeeStatus,
  FeeStructureResponse,
  RecordPaymentRequest,
  StudentFeeRecordResponse,
} from '../types/finance';

const base = '/v1/school-admin';

// ── Fee Categories ────────────────────────────────────────────────────────────

export async function listCategories(
  schoolId: string,
  activeOnly = false,
): Promise<FeeCategoryResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<FeeCategoryResponse[]>>(
    `${base}/schools/${schoolId}/fee-categories`,
    { params: { activeOnly } },
  );
  return data.data ?? [];
}

export async function createCategory(
  schoolId: string,
  body: CreateFeeCategoryRequest,
): Promise<FeeCategoryResponse> {
  const { data } = await axiosInstance.post<ApiResponse<FeeCategoryResponse>>(
    `${base}/schools/${schoolId}/fee-categories`,
    body,
  );
  return data.data!;
}

export async function deactivateCategory(categoryId: string): Promise<FeeCategoryResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<FeeCategoryResponse>>(
    `${base}/fee-categories/${categoryId}/deactivate`,
  );
  return data.data!;
}

// ── Fee Structures ────────────────────────────────────────────────────────────

export async function listStructures(
  schoolId: string,
  academicYearId: string,
): Promise<FeeStructureResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<FeeStructureResponse[]>>(
    `${base}/schools/${schoolId}/fee-structures`,
    { params: { academicYearId } },
  );
  return data.data ?? [];
}

export async function createStructure(
  schoolId: string,
  body: CreateFeeStructureRequest,
): Promise<FeeStructureResponse> {
  const { data } = await axiosInstance.post<ApiResponse<FeeStructureResponse>>(
    `${base}/schools/${schoolId}/fee-structures`,
    body,
  );
  return data.data!;
}

// ── Student Fee Records ───────────────────────────────────────────────────────

export async function listRecordsByStudent(
  studentId: string,
  academicYearId?: string,
): Promise<StudentFeeRecordResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<StudentFeeRecordResponse[]>>(
    `${base}/students/${studentId}/fee-records`,
    { params: academicYearId ? { academicYearId } : {} },
  );
  return data.data ?? [];
}

export async function listRecordsBySchool(
  schoolId: string,
  academicYearId: string,
  status?: FeeStatus,
): Promise<StudentFeeRecordResponse[]> {
  const { data } = await axiosInstance.get<ApiResponse<StudentFeeRecordResponse[]>>(
    `${base}/schools/${schoolId}/fee-records`,
    { params: { academicYearId, ...(status ? { status } : {}) } },
  );
  return data.data ?? [];
}

export async function getFeeRecord(recordId: string): Promise<StudentFeeRecordResponse> {
  const { data } = await axiosInstance.get<ApiResponse<StudentFeeRecordResponse>>(
    `${base}/fee-records/${recordId}`,
  );
  return data.data!;
}

export async function createFeeRecord(
  schoolId: string,
  body: CreateStudentFeeRecordRequest,
): Promise<StudentFeeRecordResponse> {
  const { data } = await axiosInstance.post<ApiResponse<StudentFeeRecordResponse>>(
    `${base}/schools/${schoolId}/fee-records`,
    body,
  );
  return data.data!;
}

export async function waiveFeeRecord(recordId: string): Promise<StudentFeeRecordResponse> {
  const { data } = await axiosInstance.patch<ApiResponse<StudentFeeRecordResponse>>(
    `${base}/fee-records/${recordId}/waive`,
  );
  return data.data!;
}

// ── Payments ──────────────────────────────────────────────────────────────────

export async function recordPayment(
  recordId: string,
  body: RecordPaymentRequest,
): Promise<FeePaymentResponse> {
  const { data } = await axiosInstance.post<ApiResponse<FeePaymentResponse>>(
    `${base}/fee-records/${recordId}/payments`,
    body,
  );
  return data.data!;
}

// ── Receipt ───────────────────────────────────────────────────────────────────

export async function getFeeReceipt(recordId: string): Promise<FeeReceiptResponse> {
  const { data } = await axiosInstance.get<ApiResponse<FeeReceiptResponse>>(
    `${base}/fee-records/${recordId}/receipt`,
  );
  return data.data!;
}
