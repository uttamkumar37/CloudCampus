import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SchoolWebsitePage } from './SchoolWebsitePage'

const localStorageMock = (() => {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

const submitAdmissionLeadMock = vi.fn(async (_slug: string, _payload: unknown) => ({
  success: true,
  message: 'Enquiry submitted',
  data: {
    id: 'lead-1',
    tenantId: 'demo-school',
    parentName: 'Asha Verma',
    parentEmail: 'asha@example.com',
    parentPhone: '9876543210',
    studentName: 'Riya Verma',
    applyingClass: 'Class 6',
    message: 'Need hostel information',
    status: 'NEW',
    submittedAt: '2026-05-09T00:00:00Z',
    notes: '',
  },
}))

vi.mock('../api/publicWebsiteApi', () => ({
  getPublicWebsite: async () => ({
    success: true,
    message: 'ok',
    data: {
      tenantId: 'demo-school',
      schoolName: 'Demo School',
      logoUrl: null,
      config: {
        schoolTagline: 'A strong learning community',
        schoolEmail: 'info@demo.edu',
        schoolPhone: '9999999999',
        schoolAddress: 'Main Road',
        schoolCity: 'Ranchi',
        schoolState: 'Jharkhand',
        schoolCountry: 'India',
        schoolPincode: '834001',
        heroImageUrl: '',
        aboutText: '',
        visionText: '',
        missionText: '',
        facebookUrl: '',
        twitterUrl: '',
        instagramUrl: '',
        youtubeUrl: '',
        admissionsOpen: true,
        admissionInfo: 'Admissions are open for the new session.',
        themeColor: '#10b981',
        logoUrl: '',
        schoolEstablishedYear: 2010,
        affiliationBoard: 'CBSE',
        mediumOfInstruction: 'English',
        schoolType: 'Day School',
        studentCount: 1200,
        teacherCount: 45,
        heroCtaText: 'Apply Now',
        heroCtaLink: '#admissions',
        achievementBadge: '',
        noticesText: '',
      },
      sections: [
        { sectionKey: 'hero', title: 'Welcome', subtitle: 'Admissions open', bodyJson: {}, displayOrder: 1, visible: true },
        { sectionKey: 'admissions', title: 'Admissions', subtitle: 'Join our school family', bodyJson: {}, displayOrder: 2, visible: true },
        { sectionKey: 'contact', title: 'Contact', subtitle: 'Get in touch', bodyJson: {}, displayOrder: 3, visible: true },
      ],
      gallery: [],
    },
  }),
  submitAdmissionLead: (slug: string, payload: unknown) => submitAdmissionLeadMock(slug, payload),
}))

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <SchoolWebsitePage slug="demo-school" />
    </QueryClientProvider>,
  )
}

describe('SchoolWebsitePage admissions section', () => {
  it('renders admissions guidance and submits an enquiry', async () => {
    localStorageMock.clear()
    localStorage.setItem('wb_communication', JSON.stringify({
      announcementBarEnabled: true,
      announcementBarText: 'Admissions open for 2026-27',
      announcementBarColor: '#0f766e',
      announcementBarLink: '#admissions',
    }))

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Admissions' })).toBeInTheDocument()
    })

    expect(screen.getByText('Admissions open for 2026-27')).toBeInTheDocument()

    expect(screen.getByText('Documents to keep ready')).toBeInTheDocument()
    expect(screen.getByText('Admission snapshot')).toBeInTheDocument()
    expect(screen.getByText('Birth certificate / DOB proof')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Parent / Guardian Name *'), { target: { value: 'Asha Verma' } })
    fireEvent.change(screen.getByLabelText('Phone Number *'), { target: { value: '9876543210' } })
    fireEvent.change(screen.getByLabelText('Student Name *'), { target: { value: 'Riya Verma' } })
    fireEvent.change(screen.getByLabelText('Class Applying For'), { target: { value: '6' } })
    fireEvent.change(screen.getByLabelText('Message (Optional)'), { target: { value: 'Need hostel information' } })

    fireEvent.click(screen.getByRole('button', { name: 'Submit Enquiry →' }))

    await waitFor(() => {
      expect(submitAdmissionLeadMock).toHaveBeenCalledWith('demo-school', expect.objectContaining({
        parentName: 'Asha Verma',
        parentPhone: '9876543210',
        studentName: 'Riya Verma',
        applyingClass: '6',
        message: 'Need hostel information',
      }))
    })

    expect(screen.getByText('Enquiry Submitted!')).toBeInTheDocument()
  })

  it('renders the certificate verification panel and prepares a request', async () => {
    localStorageMock.clear()
    localStorage.setItem('wb_communication', JSON.stringify({
      announcementBarEnabled: false,
      announcementBarText: '',
      announcementBarColor: '#0f766e',
      announcementBarLink: '',
    }))

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Certificate Verification')).toBeInTheDocument()
    })

    expect(screen.getByText('What the office verifies')).toBeInTheDocument()
    expect(screen.getByText(/Public requests are routed to/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Student Name'), { target: { value: 'Aarav Sharma' } })
    fireEvent.change(screen.getByLabelText('Admission No.'), { target: { value: 'ADM-1001' } })
    fireEvent.change(screen.getByLabelText('Certificate No.'), { target: { value: 'CERT-2026-001' } })
    fireEvent.change(screen.getByLabelText('Issue Year'), { target: { value: '2026' } })

    fireEvent.click(screen.getByRole('button', { name: 'Generate Verification Request' }))

    expect(screen.getByText('Verification request prepared')).toBeInTheDocument()
    expect(screen.getByText('Aarav Sharma · ADM-1001')).toBeInTheDocument()
    expect(screen.getByText('CERT-2026-001')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
  })
})