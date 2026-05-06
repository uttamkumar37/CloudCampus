import { useState } from 'react'
import { WebsiteConfigEditor } from '../components/WebsiteConfigEditor'
import { SectionsEditor } from '../components/SectionsEditor'
import { GalleryEditor } from '../components/GalleryEditor'
import { AdmissionLeadsPanel } from '../components/AdmissionLeadsPanel'

type Tab = 'config' | 'sections' | 'gallery' | 'leads'

const TABS: { key: Tab; label: string }[] = [
  { key: 'config', label: 'General Info' },
  { key: 'sections', label: 'Page Sections' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'leads', label: 'Admission Leads' },
]

export function WebsiteBuilderPage() {
  const [activeTab, setActiveTab] = useState<Tab>('config')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Website Builder</h1>
        <p className="text-sm text-slate-500 mt-1">
          Customise your school's public website. Changes are live immediately.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              activeTab === tab.key
                ? 'bg-white border border-b-white border-slate-200 text-emerald-600 -mb-px'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {activeTab === 'config' && <WebsiteConfigEditor />}
        {activeTab === 'sections' && <SectionsEditor />}
        {activeTab === 'gallery' && <GalleryEditor />}
        {activeTab === 'leads' && <AdmissionLeadsPanel />}
      </div>
    </div>
  )
}
