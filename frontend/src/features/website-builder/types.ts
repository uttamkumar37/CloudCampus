// CMS types for the website builder (SCHOOL_ADMIN) and public website

export interface WebsiteConfig {
  id?: string
  tenantId?: string
  schoolTagline: string
  schoolEmail: string
  schoolPhone: string
  schoolAddress: string
  schoolCity: string
  schoolState: string
  schoolCountry: string
  schoolPincode: string
  heroImageUrl: string
  aboutText: string
  visionText: string
  missionText: string
  facebookUrl: string
  twitterUrl: string
  instagramUrl: string
  youtubeUrl: string
  admissionsOpen: boolean
  admissionInfo: string
  themeColor: string
  logoUrl: string
  schoolEstablishedYear: number | null
  affiliationBoard: string
  mediumOfInstruction: string
  schoolType: string
  studentCount: number | null
  teacherCount: number | null
  heroCtaText: string
  heroCtaLink: string
  achievementBadge: string
  noticesText: string
  updatedAt?: string
}

export interface WebsiteSection {
  id?: string
  tenantId?: string
  sectionKey: string
  title: string
  subtitle: string
  bodyJson: Record<string, unknown>
  displayOrder: number
  visible: boolean
  updatedAt?: string
}

export interface GalleryItem {
  id?: string
  tenantId?: string
  imageUrl: string
  caption: string
  displayOrder: number
  visible: boolean
  createdAt?: string
}

export interface AdmissionLead {
  id?: string
  tenantId?: string
  parentName: string
  parentEmail: string
  parentPhone: string
  studentName: string
  applyingClass: string
  message: string
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'REJECTED'
  submittedAt?: string
  notes?: string
}

export interface AdmissionLeadRequest {
  parentName: string
  parentEmail: string
  parentPhone: string
  studentName: string
  applyingClass: string
  message: string
}

export interface PublicWebsiteData {
  tenantId: string
  schoolName: string
  logoUrl: string | null
  config: WebsiteConfig
  sections: WebsiteSection[]
  gallery: GalleryItem[]
}
