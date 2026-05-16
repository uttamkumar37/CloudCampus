import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface CreatePaymentOrderResponse {
  paymentOrderId:  string;
  gatewayOrderId:  string;
  amountPaise:     number;
  currency:        string;
  keyId:           string;
  prefillName:     string;
  prefillEmail:    string;
  prefillContact:  string;
}

export interface VerifyPaymentRequest {
  paymentOrderId:     string;
  razorpayOrderId:    string;
  razorpayPaymentId:  string;
  razorpaySignature:  string;
}

export interface FeePaymentResponse {
  id:            string;
  amount:        number;
  paymentDate:   string;
  paymentMode:   string;
  receiptNumber: string;
}

/** Student self-pay: create a Razorpay order for a fee record. */
export async function createStudentPaymentOrder(
  recordId: string,
): Promise<CreatePaymentOrderResponse> {
  const { data } = await axiosInstance.post<ApiResponse<CreatePaymentOrderResponse>>(
    `/v1/student/fee-records/${recordId}/payment-order`,
  );
  return data.data!;
}

/** Verify Razorpay signature and capture the payment. */
export async function verifyPayment(
  req: VerifyPaymentRequest,
): Promise<FeePaymentResponse> {
  const { data } = await axiosInstance.post<ApiResponse<FeePaymentResponse>>(
    '/v1/payment/verify',
    req,
  );
  return data.data!;
}
