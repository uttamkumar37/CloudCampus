import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AcademicPage } from './AcademicPage'

vi.mock('../hooks/useAcademicData', () => ({
  useAcademicClasses: () => ({ isLoading: false, isError: false, data: { data: [{ id: 'class-1' }, { id: 'class-2' }] } }),
  useAcademicSubjects: () => ({ isLoading: false, isError: false, data: { data: [{ id: 'sub-1' }, { id: 'sub-2' }, { id: 'sub-3' }] } }),
  useAcademicSections: () => ({ isLoading: false, isError: false, data: { data: [{ id: 'sec-1' }, { id: 'sec-2' }, { id: 'sec-3' }, { id: 'sec-4' }] } }),
  useCreateAcademicClass: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateAcademicSubject: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateAcademicSection: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('../components/AcademicForms', () => ({
  AcademicClassForm: () => <div>Class Form</div>,
  AcademicSubjectForm: () => <div>Subject Form</div>,
  AcademicSectionForm: () => <div>Section Form</div>,
}))

describe('AcademicPage', () => {
  it('shows an academic snapshot with class, subject, and section counts', () => {
    render(<AcademicPage />)

    expect(screen.getByText('Academic Snapshot')).toBeInTheDocument()
    expect(screen.getByText('2 classes ready for use')).toBeInTheDocument()
    expect(screen.getAllByText('Classes').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Subjects').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Sections').length).toBeGreaterThan(0)
  })
})
