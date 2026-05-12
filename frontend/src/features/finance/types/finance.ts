// Finance & Fees domain types (CC-0901 / CC-0902 / CC-0905)

export type FeeFrequency = 'ANNUAL' | 'TERM' | 'MONTHLY' | 'ONE_TIME';

export type FeeStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'WAIVED' | 'OVERDUE';

export type PaymentMode = 'CASH' | 'CHEQUE' | 'ONLINE' | 'UPI' | 'DD' | 'BANK_TRANSFER';

// ── Fee Categories ────────────────────────────────────────────────────────────

export interface FeeCategoryResponse {
  id: string;
  schoolId: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeeCategoryRequest {
  name: string;
  description?: string;
}

// ── Fee Structures ────────────────────────────────────────────────────────────

export interface FeeStructureResponse {
  id: string;
  schoolId: string;
  academicYearId: string;
  classId: string | null;
  feeCategoryId: string;
  categoryName: string;
  amount: number;
  dueDate: string | null;
  frequency: FeeFrequency;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeeStructureRequest {
  academicYearId: string;
  classId?: string;
  feeCategoryId: string;
  amount: number;
  dueDate?: string;
  frequency?: FeeFrequency;
}

// ── Student Fee Records (Invoices) ────────────────────────────────────────────

export interface StudentFeeRecordResponse {
  id: string;
  schoolId: string;
  studentId: string;
  feeStructureId: string;
  categoryName: string;
  academicYearId: string;
  amountDue: number;
  amountPaid: number;
  discount: number;
  balance: number;
  dueDate: string | null;
  status: FeeStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentFeeRecordRequest {
  studentId: string;
  feeStructureId: string;
  academicYearId: string;
  amountDue: number;
  discount?: number;
  dueDate?: string;
  notes?: string;
}

// ── Payments ──────────────────────────────────────────────────────────────────

export interface FeePaymentResponse {
  id: string;
  studentFeeRecordId: string;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  referenceNumber: string | null;
  receiptNumber: string;
  collectedByStaffId: string | null;
  remarks: string | null;
  createdAt: string;
}

export interface RecordPaymentRequest {
  amount: number;
  paymentDate?: string;
  paymentMode: PaymentMode;
  referenceNumber?: string;
  collectedByStaffId?: string;
  remarks?: string;
}

// ── Receipt (CC-0905) ─────────────────────────────────────────────────────────

export interface FeeReceiptPaymentLine {
  paymentId: string;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  referenceNumber: string | null;
  receiptNumber: string;
  remarks: string | null;
}

export interface FeeReceiptResponse {
  recordId: string;
  studentId: string;
  categoryName: string;
  amountDue: number;
  discount: number;
  amountPaid: number;
  balance: number;
  status: FeeStatus;
  dueDate: string | null;
  payments: FeeReceiptPaymentLine[];
}
