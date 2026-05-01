export type FeeStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE'

export interface FeeAssignment {
  id: string
  studentId: string
  feeTitle: string
  amount: number
  dueDate: string
  status: FeeStatus
  createdAt: string
}

export interface FeePayment {
  id: string
  feeAssignmentId: string
  amountPaid: number
  paymentDate: string
  paymentMethod: string | null
  referenceNo: string | null
  createdAt: string
}

export interface AssignFeeRequest {
  studentId: string
  feeTitle: string
  amount: number
  dueDate: string
}

export interface RecordPaymentRequest {
  feeAssignmentId: string
  amountPaid: number
  paymentDate: string
  paymentMethod: string | null
  referenceNo: string | null
}
