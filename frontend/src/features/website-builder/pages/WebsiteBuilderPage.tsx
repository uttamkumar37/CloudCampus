import { useState } from 'react'
import { WebsiteConfigEditor } from '../components/WebsiteConfigEditor'
import { SectionsEditor } from '../components/SectionsEditor'
import { GalleryEditor } from '../components/GalleryEditor'
import { AdmissionLeadsPanel } from '../components/AdmissionLeadsPanel'
import { BlogNewsEditor } from '../components/BlogNewsEditor'
import { EventsCalendarEditor } from '../components/EventsCalendarEditor'
import { TeacherDirectoryEditor } from '../components/TeacherDirectoryEditor'
import { SeoAnalyticsEditor } from '../components/SeoAnalyticsEditor'
import { CommunicationEditor } from '../components/CommunicationEditor'
import { SocialProofEditor } from '../components/SocialProofEditor'
import { AdvancedDesignEditor } from '../components/AdvancedDesignEditor'
import { FeeServicesEditor } from '../components/FeeServicesEditor'
import { CourseCatalogEditor } from '../components/CourseCatalogEditor'
import { AlumniPortfolioEditor } from '../components/AlumniPortfolioEditor'
import { MediaEmbedEditor } from '../components/MediaEmbedEditor'
import { AdmissionsToolsEditor } from '../components/AdmissionsToolsEditor'
import { MarketingToolsEditor } from '../components/MarketingToolsEditor'
import { ABTestingEditor } from '../components/ABTestingEditor'
import { MerchandiseStoreEditor } from '../components/MerchandiseStoreEditor'
import { PricingPlansSection } from '../components/PricingPlansSection'
import { storage } from '../../../utils/storage'
import type { PlanTier } from '../types'

const PLAN_ORDER: PlanTier[] = ['FREE', 'GROWTH', 'PRO', 'ELITE']

function getCurrentPlan(): PlanTier {
  return (localStorage.getItem('wb_current_plan') as PlanTier) ?? 'FREE'
}

function isPlanAtLeast(required: PlanTier): boolean {
  return PLAN_ORDER.indexOf(getCurrentPlan()) >= PLAN_ORDER.indexOf(required)
}

type Tab =
  | 'config' | 'design' | 'sections' | 'gallery'
  | 'blog' | 'events' | 'teachers' | 'social-proof'
  | 'leads' | 'fees' | 'bookings' | 'admissions-tools'
  | 'seo' | 'communication' | 'marketing' | 'media-embeds'
  | 'course-catalog' | 'alumni' | 'ab-testing' | 'merchandise'
  | 'pricing'

interface TabDef {
  key: Tab
  label: string
  icon: string
  plan?: PlanTier
  desc: string
}

const GROUPS: { label: string; color: string; tabs: TabDef[] }[] = [
  {
    label: 'Website',
    color: 'emerald',
    tabs: [
      { key: 'config', label: 'General Info', desc: 'School details, theme & contact', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
      { key: 'design', label: 'Design & Theme', desc: 'Fonts, animations, custom CSS', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', plan: 'GROWTH' },
      { key: 'sections', label: 'Page Sections', desc: 'Hero, About, Admissions…', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
      { key: 'gallery', label: 'Photo Gallery', desc: 'Showcase school photos', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ],
  },
  {
    label: 'Content',
    color: 'sky',
    tabs: [
      { key: 'blog', label: 'Blog & News', desc: 'Articles, achievements, updates', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h4', plan: 'GROWTH' },
      { key: 'events', label: 'Events Calendar', desc: 'RSVP, dates, categories', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', plan: 'GROWTH' },
      { key: 'teachers', label: 'Teacher Profiles', desc: 'Staff directory with bios', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', plan: 'PRO' },
      { key: 'social-proof', label: 'Social Proof', desc: 'Testimonials, awards, FAQ', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', plan: 'GROWTH' },
    ],
  },
  {
    label: 'Admissions',
    color: 'violet',
    tabs: [
      { key: 'leads', label: 'Admission Leads', desc: 'Enquiries from public site', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { key: 'fees', label: 'Fee Structure', desc: 'Fee tables & calculator', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', plan: 'PRO' },
      { key: 'bookings', label: 'Bookings & Services', desc: 'PTM, open day, activities', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', plan: 'PRO' },
      { key: 'admissions-tools', label: 'Admissions Tools', desc: 'Age calc, quiz, waitlist, export', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', plan: 'PRO' },
    ],
  },
  {
    label: 'Marketing',
    color: 'amber',
    tabs: [
      { key: 'seo', label: 'SEO & Analytics', desc: 'Google, meta tags, tracking', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', plan: 'GROWTH' },
      { key: 'communication', label: 'Communication', desc: 'WhatsApp, chat, newsletter', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', plan: 'PRO' },
      { key: 'marketing', label: 'Marketing Tools', desc: 'UTM, visitor counter, GBP', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z', plan: 'PRO' },
      { key: 'media-embeds', label: 'Media Embeds', desc: 'YouTube, maps, Instagram', icon: 'M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.902L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', plan: 'GROWTH' },
    ],
  },
  {
    label: 'Advanced',
    color: 'rose',
    tabs: [
      { key: 'course-catalog', label: 'Courses & Timetable', desc: 'Subjects, schedules, periods', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', plan: 'PRO' },
      { key: 'alumni', label: 'Alumni & Portfolio', desc: 'Toppers, press, portfolios', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', plan: 'PRO' },
      { key: 'ab-testing', label: 'A/B Testing & AI', desc: 'Test hero, chatbot, history', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', plan: 'ELITE' },
      { key: 'merchandise', label: 'Store & Branding', desc: 'Merch, payments, 404, i18n', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', plan: 'ELITE' },
    ],
  },
]

const PLAN_COLORS: Record<PlanTier, string> = {
  FREE: 'bg-slate-100 text-slate-600',
  GROWTH: 'bg-sky-100 text-sky-700',
  PRO: 'bg-violet-100 text-violet-700',
  ELITE: 'bg-amber-100 text-amber-700',
}

const GROUP_COLORS: Record<string, { active: string; inactive: string; dot: string }> = {
  emerald: { active: 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-100', inactive: 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50', dot: 'bg-emerald-500' },
  sky: { active: 'bg-sky-600 border-sky-600 text-white shadow-sky-100', inactive: 'bg-white border-slate-200 text-slate-600 hover:border-sky-200 hover:bg-sky-50', dot: 'bg-sky-500' },
  violet: { active: 'bg-violet-600 border-violet-600 text-white shadow-violet-100', inactive: 'bg-white border-slate-200 text-slate-600 hover:border-violet-200 hover:bg-violet-50', dot: 'bg-violet-500' },
  amber: { active: 'bg-amber-600 border-amber-600 text-white shadow-amber-100', inactive: 'bg-white border-slate-200 text-slate-600 hover:border-amber-200 hover:bg-amber-50', dot: 'bg-amber-500' },
  rose: { active: 'bg-rose-600 border-rose-600 text-white shadow-rose-100', inactive: 'bg-white border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50', dot: 'bg-rose-500' },
}

function PlanLock({ plan, onUpgrade }: { plan: PlanTier; onUpgrade: () => void }) {
  return (
    <div className="absolute inset-0 bg-white/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 border border-slate-200">
      <div className="text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="font-bold text-slate-800 text-lg">{plan} Plan Required</p>
        <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
          Unlock this feature and many more by upgrading your CloudCampus plan.
        </p>
        <button
          onClick={onUpgrade}
          className="mt-5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-sm shadow-amber-200 transition-all"
        >
          View Plans & Upgrade
        </button>
      </div>
    </div>
  )
}

export function WebsiteBuilderPage() {
  const [activeTab, setActiveTab] = useState<Tab>('config')
  const [currentPlan] = useState<PlanTier>(getCurrentPlan)
  const slug = storage.getTenantSlug()
  const schoolName = storage.getSchoolName()

  const allTabs = GROUPS.flatMap((g) => g.tabs)
  const activeTabDef = allTabs.find((t) => t.key === activeTab)
  const isLocked = activeTabDef?.plan ? !isPlanAtLeast(activeTabDef.plan) : false

  function getGridClass(count: number) {
    if (count <= 2) return 'grid-cols-2'
    if (count === 3) return 'grid-cols-3'
    return 'grid-cols-2 sm:grid-cols-4'
  }

  return (
    <div className="space-y-6 cc-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Website Builder</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${PLAN_COLORS[currentPlan]}`}>
                  {currentPlan} Plan
                </span>
                {' '}&bull; {schoolName ?? 'Your School'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {slug && (
            <a
              href={`/school/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Preview Site
            </a>
          )}
          <button
            onClick={() => setActiveTab('pricing')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Feature stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Features', value: '100+', icon: '🚀', color: 'emerald' },
          { label: 'Page Sections', value: '20+', icon: '📄', color: 'sky' },
          { label: 'Integrations', value: '25+', icon: '🔗', color: 'violet' },
          { label: 'Your Plan', value: currentPlan, icon: '⭐', color: 'amber' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grouped tab navigation */}
      <div className="space-y-3">
        {GROUPS.map((group) => {
          const gc = GROUP_COLORS[group.color]
          return (
            <div key={group.label} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${gc.dot}`} />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.label}</span>
              </div>
              <div className={`grid gap-2 ${getGridClass(group.tabs.length)}`}>
                {group.tabs.map((tab) => {
                  const isActive = activeTab === tab.key
                  const locked = tab.plan ? !isPlanAtLeast(tab.plan) : false
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative text-left p-4 rounded-2xl border transition-all ${
                        isActive ? `${gc.active} shadow-md` : gc.inactive
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <svg
                          className={`w-5 h-5 ${isActive ? 'text-white' : `text-${group.color}-500`}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                        </svg>
                        <div className="flex items-center gap-1">
                          {locked && (
                            <svg className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                          {tab.plan && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : PLAN_COLORS[tab.plan]}`}>
                              {tab.plan}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-700'}`}>{tab.label}</p>
                      <p className={`text-xs mt-0.5 ${isActive ? 'text-white/75' : 'text-slate-400'}`}>{tab.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Pricing tab */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plans</span>
          </div>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              activeTab === 'pricing'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500 text-white shadow-md shadow-amber-100'
                : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${activeTab === 'pricing' ? 'text-white' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <div>
                  <p className={`text-sm font-semibold ${activeTab === 'pricing' ? 'text-white' : 'text-slate-700'}`}>Pricing Plans</p>
                  <p className={`text-xs ${activeTab === 'pricing' ? 'text-white/75' : 'text-slate-400'}`}>Upgrade to unlock all 100+ features</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${activeTab === 'pricing' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                View Plans
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-6 cc-fade-up">
        {isLocked && activeTabDef?.plan && (
          <PlanLock plan={activeTabDef.plan} onUpgrade={() => setActiveTab('pricing')} />
        )}
        {activeTab === 'config' && <WebsiteConfigEditor />}
        {activeTab === 'design' && <AdvancedDesignEditor />}
        {activeTab === 'sections' && <SectionsEditor />}
        {activeTab === 'gallery' && <GalleryEditor />}
        {activeTab === 'blog' && <BlogNewsEditor />}
        {activeTab === 'events' && <EventsCalendarEditor />}
        {activeTab === 'teachers' && <TeacherDirectoryEditor />}
        {activeTab === 'social-proof' && <SocialProofEditor />}
        {activeTab === 'leads' && <AdmissionLeadsPanel />}
        {activeTab === 'fees' && <FeeServicesEditor />}
        {activeTab === 'bookings' && <FeeServicesEditor mode="bookings" />}
        {activeTab === 'admissions-tools' && <AdmissionsToolsEditor />}
        {activeTab === 'seo' && <SeoAnalyticsEditor />}
        {activeTab === 'communication' && <CommunicationEditor />}
        {activeTab === 'marketing' && <MarketingToolsEditor />}
        {activeTab === 'media-embeds' && <MediaEmbedEditor />}
        {activeTab === 'course-catalog' && <CourseCatalogEditor />}
        {activeTab === 'alumni' && <AlumniPortfolioEditor />}
        {activeTab === 'ab-testing' && <ABTestingEditor />}
        {activeTab === 'merchandise' && <MerchandiseStoreEditor />}
        {activeTab === 'pricing' && <PricingPlansSection currentPlan={currentPlan} onPlanChange={() => window.location.reload()} />}
      </div>
    </div>
  )
}
