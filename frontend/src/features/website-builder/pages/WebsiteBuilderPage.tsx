import { useState } from 'react'
import { WebsiteConfigEditor } from '../components/WebsiteConfigEditor'
import { SectionsEditor } from '../components/SectionsEditor'
import { GalleryEditor } from '../components/GalleryEditor'
import { AdmissionLeadsPanel } from '../components/AdmissionLeadsPanel'
import { storage } from '../../../utils/storage'

type Tab = 'config' | 'sections' | 'gallery' | 'leads'

const TABS: { key: Tab; label: string; icon: string; desc: string }[] = [
  {
    key: 'config',
    label: 'General Info',
    desc: 'School details, theme & contact',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    key: 'sections',
    label: 'Page Sections',
    desc: 'Hero, About, Admissions…',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  },
  {
    key: 'gallery',
    label: 'Photo Gallery',
    desc: 'Showcase school photos',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    key: 'leads',
    label: 'Admission Leads',
    desc: 'Enquiries from public site',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

export function WebsiteBuilderPage() {
  const [activeTab, setActiveTab] = useState<Tab>('config')
  const slug = storage.getTenantSlug()
  const schoolName = storage.getSchoolName()

  return (
    <div className="space-y-6 cc-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
              </svg>
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Website Builder</h1>
          </div>
          <p className="text-sm text-slate-500">
            Build and manage <span className="font-medium text-slate-700">{schoolName ?? 'your school'}'s</span> public website. Changes go live immediately.
          </p>
        </div>
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
            Preview Website
          </a>
        )}
      </div>

      {/* Tab cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-left p-4 rounded-2xl border transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100'
                : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <svg
              className={`w-5 h-5 mb-2 ${activeTab === tab.key ? 'text-white' : 'text-emerald-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            <p className={`text-sm font-semibold ${activeTab === tab.key ? 'text-white' : 'text-slate-700'}`}>
              {tab.label}
            </p>
            <p className={`text-xs mt-0.5 ${activeTab === tab.key ? 'text-white/80' : 'text-slate-400'}`}>
              {tab.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 cc-fade-up">
        {activeTab === 'config' && <WebsiteConfigEditor />}
        {activeTab === 'sections' && <SectionsEditor />}
        {activeTab === 'gallery' && <GalleryEditor />}
        {activeTab === 'leads' && <AdmissionLeadsPanel />}
      </div>
    </div>
  )
}
