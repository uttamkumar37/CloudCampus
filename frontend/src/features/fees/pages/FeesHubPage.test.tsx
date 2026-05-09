import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FeesHubPage } from './FeesHubPage'

const writeTextMock = vi.fn(async (_text: string) => undefined)

Object.assign(navigator, {
  clipboard: {
    writeText: writeTextMock,
  },
})

vi.mock('../../../utils/storage', () => ({
  storage: {
    getRole: () => 'SCHOOL_ADMIN',
    setRole: vi.fn(),
    removeRole: vi.fn(),
    getTenantSlug: vi.fn(),
    setTenantSlug: vi.fn(),
    removeTenantSlug: vi.fn(),
    getSchoolName: vi.fn(),
    setSchoolName: vi.fn(),
    removeSchoolName: vi.fn(),
    getUsername: vi.fn(),
    setUsername: vi.fn(),
    removeUsername: vi.fn(),
  },
}))

vi.mock('../../../components/ui/SearchableSelect', () => ({
  SearchableSelect: ({ label, selectedValue, onSelect, options, placeholder, disabled }: any) => (
    <label>
      {label}
      <select aria-label={label} value={selectedValue} onChange={(e) => onSelect(e.target.value)} disabled={disabled}>
        <option value="">{placeholder ?? 'Select'}</option>
        {options.map((option: { value: string; label: string }) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}))

vi.mock('../../academic/hooks/useSchoolDirectory', () => ({
  useSchoolDirectory: () => ({
    students: [
      { id: 'student-1', firstName: 'Aarav', lastName: 'Sharma', admissionNo: 'ADM-1001' },
    ],
    studentOptions: [
      { value: 'student-1', label: 'Aarav Sharma - ADM-1001', searchText: 'Aarav Sharma ADM-1001' },
    ],
    isLoading: false,
    hasError: false,
  }),
}))

vi.mock('../../dashboard/hooks/useStudentDashboard', () => ({
  useStudentDashboard: () => ({ isLoading: false, data: { data: { profile: { id: 'student-1', firstName: 'Aarav', lastName: 'Sharma' } } } }),
}))

vi.mock('../../parent/hooks/useMyChildren', () => ({
  useMyChildren: () => ({ isLoading: false, data: { data: [] } }),
}))

vi.mock('../hooks/useFees', () => ({
  useFeeAssignments: (studentId: string) => ({
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    data: studentId
      ? {
          data: [
            { id: 'fee-1', studentId, feeTitle: 'Term 1 Tuition', amount: 10000, paidAmount: 6000, dueAmount: 4000, dueDate: '2026-06-10', status: 'PARTIALLY_PAID', createdAt: '2026-05-01T00:00:00Z' },
            { id: 'fee-2', studentId, feeTitle: 'Lab Fee', amount: 2000, paidAmount: 0, dueAmount: 2000, dueDate: '2026-05-01', status: 'OVERDUE', createdAt: '2026-05-01T00:00:00Z' },
          ],
        }
      : { data: [] },
  }),
  useAssignFee: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useRecordPayment: () => ({
    isPending: false,
    mutateAsync: vi.fn(async (payload: any) => ({
      success: true,
      message: 'Recorded',
      data: {
        id: 'payment-1',
        feeAssignmentId: payload.feeAssignmentId,
        amountPaid: payload.amountPaid,
        paymentDate: payload.paymentDate,
        paymentMethod: payload.paymentMethod,
        referenceNo: payload.referenceNo,
        receivedByUserId: 'user-1',
        createdAt: '2026-05-09T10:15:00Z',
      },
    })),
  }),
}))

vi.mock('../../../utils/toast', () => ({
  showToast: vi.fn(),
}))

function renderPage() {
  return render(<FeesHubPage />)
}

describe('FeesHubPage', () => {
  it('shows a fee health snapshot for the selected student', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Fee Health Snapshot')).toBeInTheDocument()
    })

    const totalDueChip = screen.getByText('Total Due').closest('div')
    const totalPaidChip = screen.getByText('Total Paid').closest('div')
    const pendingChip = screen.getByText('Pending Items').closest('div')
    const overdueChip = screen.getByText('Overdue Items').closest('div')

    expect(totalDueChip).not.toBeNull()
    expect(totalPaidChip).not.toBeNull()
    expect(pendingChip).not.toBeNull()
    expect(overdueChip).not.toBeNull()

    expect(within(totalDueChip!).getByText('₹ 6,000')).toBeInTheDocument()
    expect(within(totalPaidChip!).getByText('₹ 6,000')).toBeInTheDocument()
    expect(within(pendingChip!).getByText('1')).toBeInTheDocument()
    expect(within(overdueChip!).getByText('1')).toBeInTheDocument()
  })

  it('adds a recent receipt after recording a payment', async () => {
    renderPage()

    const feeAssignmentSelect = screen.getAllByLabelText('Fee Assignment')[0]
    const amountInput = screen.getAllByPlaceholderText('5000')[0]
    const paymentMethodInput = screen.getAllByPlaceholderText('CASH / BANK_TRANSFER / CHEQUE')[0]
    const referenceInput = screen.getAllByPlaceholderText('RCP-20260428-001')[0]

    await waitFor(() => {
      expect(feeAssignmentSelect).not.toHaveAttribute('disabled')
    })

    fireEvent.change(feeAssignmentSelect, { target: { value: 'fee-2' } })
    fireEvent.change(amountInput, { target: { value: '2000' } })
    fireEvent.change(paymentMethodInput, { target: { value: 'CASH' } })
    fireEvent.change(referenceInput, { target: { value: 'RCP-001' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Record Payment' })[0])

    await waitFor(() => {
      expect(screen.getByText('Recent Receipts')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Export Receipts CSV' }))

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled()
    })

    expect(writeTextMock.mock.calls[0][0]).toContain('Receipt ID')
    expect(writeTextMock.mock.calls[0][0]).toContain('RCP-001')

    const receiptTitle = screen.getAllByText('Lab Fee').at(-1)
    const receiptCard = receiptTitle?.closest('div')
    expect(receiptCard).not.toBeNull()
    expect(screen.getAllByText('Method: CASH').at(-1)).toBeInTheDocument()
    expect(screen.getAllByText('Ref: RCP-001').at(-1)).toBeInTheDocument()
  })
})