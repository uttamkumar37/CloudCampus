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

// ── New premium feature types ──

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImageUrl: string
  author: string
  category: 'Academic' | 'Achievement' | 'Event' | 'Sports' | 'News' | 'Other'
  tags: string
  publishedAt: string
  visible: boolean
  featured: boolean
  createdAt: string
}

export interface SchoolEvent {
  id: string
  title: string
  description: string
  eventDate: string
  endDate: string
  location: string
  eventType: 'Academic' | 'Cultural' | 'Sports' | 'Exam' | 'Holiday' | 'Meeting' | 'Other'
  rsvpEnabled: boolean
  maxAttendees: number | null
  imageUrl: string
  registrationLink: string
  visible: boolean
  createdAt: string
}

export interface TeacherProfile {
  id: string
  name: string
  designation: string
  subject: string
  qualification: string
  experience: string
  photoUrl: string
  bio: string
  email: string
  linkedinUrl: string
  displayOrder: number
  visible: boolean
  featured: boolean
}

export interface Testimonial {
  id: string
  authorName: string
  authorRole: 'Parent' | 'Alumni' | 'Student' | 'Staff'
  photoUrl: string
  quote: string
  rating: number
  visible: boolean
  featured: boolean
  displayOrder: number
  yearOfAssociation: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  displayOrder: number
  visible: boolean
}

export interface AwardBadge {
  id: string
  title: string
  issuedBy: string
  year: string
  logoUrl: string
  description: string
  displayOrder: number
  visible: boolean
}

export interface SeoSettings {
  metaTitle: string
  metaDescription: string
  ogImageUrl: string
  googleAnalyticsId: string
  facebookPixelId: string
  googleSearchConsoleToken: string
  schemaOrgEnabled: boolean
  sitemapEnabled: boolean
  keywords: string
  robotsTxt: string
  canonicalUrl: string
}

export interface CommunicationSettings {
  whatsappEnabled: boolean
  whatsappNumber: string
  whatsappMessage: string
  whatsappPosition: 'bottom-right' | 'bottom-left'
  liveChatEnabled: boolean
  liveChatProvider: 'crisp' | 'tawk' | 'intercom' | 'freshchat'
  liveChatWidgetId: string
  newsletterEnabled: boolean
  newsletterProvider: 'mailchimp' | 'convertkit' | 'sendinblue'
  newsletterApiKey: string
  newsletterListId: string
  newsletterPlaceholder: string
  pushNotificationsEnabled: boolean
  announcementBarEnabled: boolean
  announcementBarText: string
  announcementBarColor: string
  announcementBarLink: string
}

export interface FeeItem {
  id: string
  className: string
  admissionFee: number
  tuitionFeeMonthly: number
  annualCharges: number
  examFee: number
  sportsFee: number
  libraryFee: number
  transportFee: number
  hostelFee: number
  notes: string
  displayOrder: number
}

export interface DesignSettings {
  fontFamily: string
  headerFont: string
  bodyFont: string
  borderRadius: 'sharp' | 'rounded' | 'very-rounded'
  buttonStyle: 'filled' | 'outlined' | 'gradient' | 'soft'
  animationsEnabled: boolean
  animationStyle: 'fade' | 'slide' | 'zoom' | 'bounce'
  darkModeEnabled: boolean
  customCss: string
  stickyHeaderEnabled: boolean
  backToTopEnabled: boolean
  pageWidth: 'full' | 'wide' | 'normal' | 'narrow'
  heroStyle: 'image' | 'video' | 'gradient' | 'pattern'
  heroVideoUrl: string
  navStyle: 'transparent' | 'solid' | 'frosted'
}

export interface BookingConfig {
  ptmEnabled: boolean
  ptmCalendarLink: string
  ptmDescription: string
  openDayEnabled: boolean
  openDayDate: string
  openDayDescription: string
  openDayRegistrationLink: string
  virtualTourEnabled: boolean
  virtualTourUrl: string
  virtualTourDescription: string
  campusVisitEnabled: boolean
  campusVisitContact: string
  campusVisitNote: string
  activityRegistrationEnabled: boolean
  activities: ActivityItem[]
}

export interface ActivityItem {
  id: string
  name: string
  description: string
  fee: number
  schedule: string
  ageGroup: string
  maxStudents: number | null
  registrationLink: string
  visible: boolean
}

export type PlanTier = 'FREE' | 'GROWTH' | 'PRO' | 'ELITE'
