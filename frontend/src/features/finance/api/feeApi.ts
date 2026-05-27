import { httpClient } from '../../../shared/api/httpClient';

export type FeeDemandStatus = 'OPEN' | 'PARTIALLY_PAID' | 'PAID';

export type FeeDemandCreateRequest = {
  studentId: string;
  description: string;
  amount: number;
  dueDate: string;
};

export type FeePaymentCreateRequest = {
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
};

export type FeePaymentResponse = {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  receiptNumber: string;
  paidAt: string;
  recordedByUserId: string;
};

export type FinanceReceiptResponse = {
  id: string;
  tenantId: string;
  schoolId: string;
  demandId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  receiptNumber: string;
  paidAt: string;
  recordedByUserId: string;
  recordedByName: string;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type FinanceReportSummary = {
  totalDemanded: number;
  totalCollected: number;
  totalOutstanding: number;
  demandCount: number;
  receiptCount: number;
  openDemandCount: number;
  partiallyPaidDemandCount: number;
  paidDemandCount: number;
};

export type FinanceCollections = {
  items: Array<{
    date: string;
    totalCollected: number;
    receiptCount: number;
  }>;
};

export type FeeDemandResponse = {
  id: string;
  tenantId: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  description: string;
  amountDue: number;
  amountPaid: number;
  outstandingAmount: number;
  dueDate: string;
  status: FeeDemandStatus;
  createdAt: string;
  payments: FeePaymentResponse[];
};

export async function createFeeDemand(
  request: FeeDemandCreateRequest,
  accessToken: string,
): Promise<FeeDemandResponse> {
  return createDemandAt('/v1/school-admin/fees/demands', request, accessToken);
}

export async function createFinanceFeeDemand(
  request: FeeDemandCreateRequest,
  accessToken: string,
): Promise<FeeDemandResponse> {
  return createDemandAt('/v1/finance/fees/demands', request, accessToken);
}

async function createDemandAt(
  path: string,
  request: FeeDemandCreateRequest,
  accessToken: string,
): Promise<FeeDemandResponse> {
  return httpClient.post<FeeDemandResponse>(path, request, { accessToken });
}

export async function recordFeePayment(
  demandId: string,
  request: FeePaymentCreateRequest,
  accessToken: string,
): Promise<FeeDemandResponse> {
  return recordPaymentAt(`/v1/school-admin/fees/demands/${demandId}/payments`, request, accessToken);
}

export async function recordFinanceFeePayment(
  demandId: string,
  request: FeePaymentCreateRequest,
  accessToken: string,
): Promise<FeeDemandResponse> {
  return recordPaymentAt(`/v1/finance/fees/demands/${demandId}/payments`, request, accessToken);
}

async function recordPaymentAt(
  path: string,
  request: FeePaymentCreateRequest,
  accessToken: string,
): Promise<FeeDemandResponse> {
  return httpClient.post<FeeDemandResponse>(path, request, { accessToken });
}

export function listFinanceReceipts(accessToken: string) {
  return httpClient.get<PageResponse<FinanceReceiptResponse>>('/v1/finance/receipts?size=50', { accessToken });
}

export function getFinanceReportSummary(accessToken: string) {
  return httpClient.get<FinanceReportSummary>('/v1/finance/reports/summary', { accessToken });
}

export function getFinanceCollections(accessToken: string) {
  return httpClient.get<FinanceCollections>('/v1/finance/reports/collections', { accessToken });
}
