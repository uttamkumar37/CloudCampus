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
  const response = await fetch('/v1/school-admin/fees/demands', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Fee demand creation failed.');
  }

  return response.json() as Promise<FeeDemandResponse>;
}

export async function recordFeePayment(
  demandId: string,
  request: FeePaymentCreateRequest,
  accessToken: string,
): Promise<FeeDemandResponse> {
  const response = await fetch(`/v1/school-admin/fees/demands/${demandId}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Fee payment recording failed.');
  }

  return response.json() as Promise<FeeDemandResponse>;
}
