import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';
import { listDomainsApi } from '@/features/school-admin/api/domainApi';
import { useToast, PageSpinner, LockedFeature } from '@/shared/ui';
import { useEntitlement } from '@/shared/hooks/useEntitlement';
import {
  getWebsiteApi,
  setPublishedApi,
  listPagesApi,
  createPageApi,
  updatePageApi,
  deletePageApi,
  listSectionsApi,
  addSectionApi,
  updateSectionApi,
  deleteSectionApi,
  addNavItemApi,
  listNavApi,
  type PageResponse,
  type PageRequest,
  type SectionResponse,
  type SectionRequest,
} from '../api/websiteApi';

type BuilderTab = 'build' | 'templates' | 'cms' | 'ai' | 'launch' | 'analytics';
type PreviewMode = 'desktop' | 'tablet' | 'mobile';
type SectionType =
  | 'HERO'
  | 'TEXT'
  | 'STATS'
  | 'GALLERY'
  | 'CONTACT'
  | 'CTA'
  | 'NOTICE'
  | 'EVENTS'
  | 'FACULTY'
  | 'ADMISSIONS';

type TemplateKey =
  | 'government'
  | 'international'
  | 'coaching'
  | 'college'
  | 'residential'
  | 'modern';

interface SectionPreset {
  type: SectionType;
  label: string;
  description: string;
  plan: PlanCode;
  content: Record<string, unknown>;
}

interface WebsiteTemplate {
  key: TemplateKey;
  name: string;
  category: string;
  plan: PlanCode;
  accent: string;
  pages: Array<{
    title: string;
    slug: string;
    sections: Array<Pick<SectionPreset, 'type' | 'content'>>;
  }>;
}

type PlanCode = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'AI_PREMIUM';

const PLAN_ORDER: PlanCode[] = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'AI_PREMIUM'];

const PLAN_FEATURES: Record<PlanCode, {
  name: string;
  pages: string;
  templates: string;
  customDomain: boolean;
  ai: boolean;
  analytics: boolean;
  badge: string;
}> = {
  FREE: {
    name: 'Free',
    pages: '1 published page',
    templates: 'Basic template',
    customDomain: false,
    ai: false,
    analytics: false,
    badge: 'bg-slate-100 text-slate-700',
  },
  STARTER: {
    name: 'Starter',
    pages: '5 pages',
    templates: 'Starter templates',
    customDomain: false,
    ai: false,
    analytics: false,
    badge: 'bg-sky-100 text-sky-700',
  },
  PROFESSIONAL: {
    name: 'Professional',
    pages: '25 pages',
    templates: 'Premium templates',
    customDomain: true,
    ai: true,
    analytics: true,
    badge: 'bg-indigo-100 text-indigo-700',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    pages: 'Unlimited pages',
    templates: 'Enterprise templates',
    customDomain: true,
    ai: true,
    analytics: true,
    badge: 'bg-emerald-100 text-emerald-700',
  },
  AI_PREMIUM: {
    name: 'AI Premium',
    pages: 'Base plan pages',
    templates: 'AI optimized',
    customDomain: true,
    ai: true,
    analytics: true,
    badge: 'bg-amber-100 text-amber-800',
  },
};

const CURRENT_PLAN: PlanCode = 'PROFESSIONAL';

const PREVIEW_WIDTH: Record<PreviewMode, string> = {
  desktop: 'max-w-6xl',
  tablet: 'max-w-3xl',
  mobile: 'max-w-sm',
};

const SECTION_PRESETS: SectionPreset[] = [
  {
    type: 'HERO',
    label: 'Premium Hero',
    description: 'School headline, promise, admissions CTA, and trust badges.',
    plan: 'FREE',
    content: {
      badge: 'Admissions Open',
      heading: 'A future-ready learning campus for every child',
      subheading: 'Create a modern school website with academics, admissions, achievements, and parent trust in one place.',
      ctaText: 'Apply for Admission',
      ctaUrl: '#admissions',
      highlights: ['CBSE aligned', 'Smart classrooms', 'Parent engagement'],
    },
  },
  {
    type: 'STATS',
    label: 'Trust Metrics',
    description: 'Showcase students, faculty, results, and campus scale.',
    plan: 'FREE',
    content: {
      stats: [
        { value: '1,200+', label: 'Students' },
        { value: '95%', label: 'Board Results' },
        { value: '80+', label: 'Educators' },
        { value: '25+', label: 'Activities' },
      ],
    },
  },
  {
    type: 'TEXT',
    label: 'About School',
    description: 'Narrative section with highlights and feature cards.',
    plan: 'FREE',
    content: {
      heading: 'About our school',
      body: 'We combine strong academics, values, sports, creativity, and technology to help students grow with confidence.',
      highlights: ['Experienced teachers', 'Safe campus', 'Holistic development', 'Digital learning'],
    },
  },
  {
    type: 'ADMISSIONS',
    label: 'Admissions Funnel',
    description: 'Admission steps and inquiry CTA for conversion.',
    plan: 'STARTER',
    content: {
      heading: 'Admissions made simple',
      body: 'Families can understand eligibility, documents, deadlines, and next steps in minutes.',
      steps: [
        { step: 1, title: 'Submit inquiry', desc: 'Share student and parent details.' },
        { step: 2, title: 'Campus interaction', desc: 'Meet the admissions team.' },
        { step: 3, title: 'Confirm admission', desc: 'Complete documents and fee formalities.' },
      ],
      ctaText: 'Start Admission Inquiry',
    },
  },
  {
    type: 'FACULTY',
    label: 'Faculty Showcase',
    description: 'Teacher profiles with departments and achievements.',
    plan: 'PROFESSIONAL',
    content: {
      heading: 'Meet our educators',
      team: [
        { name: 'Anita Sharma', title: 'Principal', bio: 'Academic leader focused on student growth and school excellence.' },
        { name: 'Rahul Verma', title: 'Science Faculty', bio: 'Mentor for science fairs, Olympiads, and lab-based learning.' },
      ],
    },
  },
  {
    type: 'GALLERY',
    label: 'Campus Gallery',
    description: 'Visual campus, activities, labs, and event gallery.',
    plan: 'STARTER',
    content: {
      title: 'Campus life',
      images: [
        { url: '', caption: 'Smart classroom' },
        { url: '', caption: 'Science lab' },
        { url: '', caption: 'Sports day' },
      ],
    },
  },
  {
    type: 'NOTICE',
    label: 'Announcement Ticker',
    description: 'Important notices for parents and students.',
    plan: 'STARTER',
    content: {
      heading: 'Latest announcements',
      notices: [
        'Admissions for the next academic year are open.',
        'Parent-teacher meeting scheduled this Saturday.',
        'Annual sports meet registrations are live.',
      ],
    },
  },
  {
    type: 'CTA',
    label: 'Conversion CTA',
    description: 'Inquiry, callback, WhatsApp, or admission action block.',
    plan: 'PROFESSIONAL',
    content: {
      heading: 'Ready to visit our campus?',
      body: 'Book a guided campus tour and meet our admissions counselor.',
      ctaText: 'Request Callback',
      ctaUrl: '#contact',
    },
  },
  {
    type: 'CONTACT',
    label: 'Contact Block',
    description: 'Address, phone, email, and admission contact details.',
    plan: 'FREE',
    content: {
      address: 'Add your campus address',
      phone: '+91 00000 00000',
      email: 'admissions@school.edu',
    },
  },
];

const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    key: 'government',
    name: 'Government School',
    category: 'Compliance ready',
    plan: 'FREE',
    accent: 'from-blue-700 to-cyan-600',
    pages: [
      {
        title: 'Home',
        slug: 'home',
        sections: [SECTION_PRESETS[0], SECTION_PRESETS[1], SECTION_PRESETS[6], SECTION_PRESETS[8]],
      },
      {
        title: 'About',
        slug: 'about',
        sections: [SECTION_PRESETS[2], SECTION_PRESETS[4]],
      },
      {
        title: 'Admissions',
        slug: 'admissions',
        sections: [SECTION_PRESETS[3], SECTION_PRESETS[8]],
      },
    ],
  },
  {
    key: 'international',
    name: 'International School',
    category: 'Premium admissions',
    plan: 'PROFESSIONAL',
    accent: 'from-indigo-700 to-sky-500',
    pages: [
      { title: 'Home', slug: 'home', sections: [SECTION_PRESETS[0], SECTION_PRESETS[1], SECTION_PRESETS[7], SECTION_PRESETS[5]] },
      { title: 'Academics', slug: 'academics', sections: [SECTION_PRESETS[2], SECTION_PRESETS[4]] },
      { title: 'Admissions', slug: 'admissions', sections: [SECTION_PRESETS[3], SECTION_PRESETS[8]] },
    ],
  },
  {
    key: 'coaching',
    name: 'Coaching Institute',
    category: 'Results focused',
    plan: 'STARTER',
    accent: 'from-emerald-700 to-teal-500',
    pages: [
      { title: 'Home', slug: 'home', sections: [SECTION_PRESETS[0], SECTION_PRESETS[1], SECTION_PRESETS[7]] },
      { title: 'Courses', slug: 'courses', sections: [SECTION_PRESETS[2], SECTION_PRESETS[3]] },
      { title: 'Results', slug: 'results', sections: [SECTION_PRESETS[1], SECTION_PRESETS[5]] },
    ],
  },
  {
    key: 'college',
    name: 'College',
    category: 'Departments and campus',
    plan: 'PROFESSIONAL',
    accent: 'from-slate-800 to-violet-600',
    pages: [
      { title: 'Home', slug: 'home', sections: [SECTION_PRESETS[0], SECTION_PRESETS[1], SECTION_PRESETS[5]] },
      { title: 'Departments', slug: 'departments', sections: [SECTION_PRESETS[2], SECTION_PRESETS[4]] },
      { title: 'Admissions', slug: 'admissions', sections: [SECTION_PRESETS[3], SECTION_PRESETS[8]] },
    ],
  },
  {
    key: 'residential',
    name: 'Residential School',
    category: 'Hostel and trust',
    plan: 'PROFESSIONAL',
    accent: 'from-teal-700 to-blue-600',
    pages: [
      { title: 'Home', slug: 'home', sections: [SECTION_PRESETS[0], SECTION_PRESETS[1], SECTION_PRESETS[5]] },
      { title: 'Campus Life', slug: 'campus-life', sections: [SECTION_PRESETS[5], SECTION_PRESETS[2]] },
      { title: 'Admissions', slug: 'admissions', sections: [SECTION_PRESETS[3], SECTION_PRESETS[8]] },
    ],
  },
  {
    key: 'modern',
    name: 'Modern Premium School',
    category: 'Investor-demo ready',
    plan: 'AI_PREMIUM',
    accent: 'from-fuchsia-700 to-amber-500',
    pages: [
      { title: 'Home', slug: 'home', sections: [SECTION_PRESETS[0], SECTION_PRESETS[1], SECTION_PRESETS[7], SECTION_PRESETS[5]] },
      { title: 'Learning', slug: 'learning', sections: [SECTION_PRESETS[2], SECTION_PRESETS[4]] },
      { title: 'Admissions', slug: 'admissions', sections: [SECTION_PRESETS[3], SECTION_PRESETS[8]] },
    ],
  },
];

function canUse(required: PlanCode) {
  return PLAN_ORDER.indexOf(CURRENT_PLAN) >= PLAN_ORDER.indexOf(required);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function arrayValue<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function getSectionTitle(section: SectionResponse) {
  return stringValue(section.content.heading)
    || stringValue(section.content.title)
    || stringValue(section.content.badge)
    || section.sectionType;
}

function getSectionSummary(section: SectionResponse) {
  const text = stringValue(section.content.subheading)
    || stringValue(section.content.body)
    || stringValue(section.content.text)
    || stringValue(section.content.ctaText);
  if (text) return text;
  if (Array.isArray(section.content.stats)) return `${section.content.stats.length} metrics`;
  if (Array.isArray(section.content.images)) return `${section.content.images.length} images`;
  if (Array.isArray(section.content.notices)) return `${section.content.notices.length} notices`;
  return 'Ready for visual editing';
}

interface PageFormProps {
  initial?: PageResponse;
  defaultOrder: number;
  onSave: (req: PageRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function PageForm({ initial, defaultOrder, onSave, onCancel, isSaving }: PageFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? '');
  const [seoDesc, setSeoDesc] = useState(initial?.seoDescription ?? '');
  const [published, setPublished] = useState(initial?.published ?? false);
  const [displayOrder, setDisplayOrder] = useState(initial?.displayOrder ?? defaultOrder);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!initial) setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      title: title.trim(),
      slug: slugify(slug || title),
      seoTitle: seoTitle.trim() || title.trim(),
      seoDescription: seoDesc.trim() || undefined,
      published,
      displayOrder,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Page title
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Admissions"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          URL slug
          <input
            type="text"
            required
            pattern="[a-z0-9-]+"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admissions"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          SEO title
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Display order
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        SEO description
        <textarea
          value={seoDesc}
          onChange={(e) => setSeoDesc(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600"
        />
        Publish this page
      </label>
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={isSaving || !title.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Page'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

interface SectionEditorProps {
  initial?: SectionResponse;
  nextPosition: number;
  onSave: (req: SectionRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function SectionEditor({ initial, nextPosition, onSave, onCancel, isSaving }: SectionEditorProps) {
  const [sectionType, setSectionType] = useState<SectionType>((initial?.sectionType as SectionType) ?? 'TEXT');
  const [position, setPosition] = useState(initial?.position ?? nextPosition);
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [advanced, setAdvanced] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [content, setContent] = useState<Record<string, unknown>>(initial?.content ?? SECTION_PRESETS.find((p) => p.type === sectionType)?.content ?? {});
  const [contentJson, setContentJson] = useState(JSON.stringify(initial?.content ?? content, null, 2));

  function setField(key: string, value: unknown) {
    const next = { ...content, [key]: value };
    setContent(next);
    setContentJson(JSON.stringify(next, null, 2));
  }

  function handleTypeChange(value: SectionType) {
    setSectionType(value);
    const preset = SECTION_PRESETS.find((p) => p.type === value);
    if (!initial && preset) {
      setContent(preset.content);
      setContentJson(JSON.stringify(preset.content, null, 2));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const parsed = advanced ? JSON.parse(contentJson) : content;
      setJsonError('');
      onSave({ sectionType, position, content: parsed, visible });
    } catch {
      setJsonError('Invalid JSON. Check commas, quotes, and brackets.');
    }
  }

  const notices = arrayValue<string>(content.notices).join('\n');
  const highlights = arrayValue<string>(content.highlights).join('\n');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="block text-sm font-medium text-slate-700">
          Section
          <select
            value={sectionType}
            onChange={(e) => handleTypeChange(e.target.value as SectionType)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SECTION_PRESETS.map((preset) => (
              <option key={preset.type} value={preset.type}>{preset.label}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Position
          <input
            type="number"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="mt-7 flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
          />
          Visible on website
        </label>
      </div>

      {!advanced && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="block text-sm font-medium text-slate-700">
            Heading / title
            <input
              value={stringValue(content.heading) || stringValue(content.title)}
              onChange={(e) => setField(sectionType === 'GALLERY' ? 'title' : 'heading', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          {sectionType !== 'STATS' && sectionType !== 'GALLERY' && sectionType !== 'CONTACT' && (
            <label className="block text-sm font-medium text-slate-700">
              Body / subheading
              <textarea
                rows={3}
                value={stringValue(content.subheading) || stringValue(content.body) || stringValue(content.text)}
                onChange={(e) => setField(sectionType === 'HERO' ? 'subheading' : 'body', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          )}
          {(sectionType === 'HERO' || sectionType === 'CTA' || sectionType === 'ADMISSIONS') && (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                CTA label
                <input
                  value={stringValue(content.ctaText)}
                  onChange={(e) => setField('ctaText', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                CTA link
                <input
                  value={stringValue(content.ctaUrl)}
                  onChange={(e) => setField('ctaUrl', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          )}
          {(sectionType === 'TEXT' || sectionType === 'HERO') && (
            <label className="block text-sm font-medium text-slate-700">
              Highlights, one per line
              <textarea
                rows={4}
                value={highlights}
                onChange={(e) => setField('highlights', e.target.value.split('\n').map((v) => v.trim()).filter(Boolean))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          )}
          {sectionType === 'NOTICE' && (
            <label className="block text-sm font-medium text-slate-700">
              Notices, one per line
              <textarea
                rows={5}
                value={notices}
                onChange={(e) => setField('notices', e.target.value.split('\n').map((v) => v.trim()).filter(Boolean))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          )}
          {sectionType === 'CONTACT' && (
            <div className="grid gap-3 md:grid-cols-3">
              {['address', 'phone', 'email'].map((key) => (
                <label key={key} className="block text-sm font-medium capitalize text-slate-700">
                  {key}
                  <input
                    value={stringValue(content[key])}
                    onChange={(e) => setField(key, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {advanced && (
        <div>
          <label className="block text-sm font-medium text-slate-700">Advanced JSON</label>
          <textarea
            value={contentJson}
            onChange={(e) => { setContentJson(e.target.value); setJsonError(''); }}
            rows={10}
            spellCheck={false}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {jsonError && <p className="mt-1 text-xs text-red-600">{jsonError}</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setAdvanced((value) => !value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
        >
          {advanced ? 'Use Visual Editor' : 'Advanced JSON'}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Section'}
          </button>
        </div>
      </div>
    </form>
  );
}

function SectionMiniPreview({ section }: { section: SectionResponse }) {
  const title = getSectionTitle(section);
  const summary = getSectionSummary(section);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="bg-gradient-to-r from-slate-900 via-blue-800 to-cyan-700 px-4 py-5 text-white">
        <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-100">{section.sectionType}</p>
        <p className="mt-1 line-clamp-2 text-lg font-bold">{title}</p>
      </div>
      <div className="p-4">
        <p className="line-clamp-2 text-sm text-slate-600">{summary}</p>
      </div>
    </div>
  );
}

interface SectionsPanelProps {
  schoolId: string;
  page: PageResponse;
  previewMode: PreviewMode;
}

function SectionsPanel({ schoolId, page, previewMode }: SectionsPanelProps) {
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();
  const [addingSection, setAddingSection] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionResponse | null>(null);

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['website-sections', schoolId, page.id],
    queryFn: () => listSectionsApi(schoolId, page.id),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['website-sections', schoolId, page.id] });

  const addMut = useMutation({
    mutationFn: (req: SectionRequest) => addSectionApi(schoolId, page.id, req),
    onSuccess: () => { success('Section added'); invalidate(); setAddingSection(false); },
    onError: () => { toastError('Failed to add section.'); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, req }: { id: string; req: SectionRequest }) =>
      updateSectionApi(schoolId, page.id, id, req),
    onSuccess: () => { success('Section updated'); invalidate(); setEditingSection(null); },
    onError: () => { toastError('Failed to update section.'); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSectionApi(schoolId, page.id, id),
    onSuccess: () => { success('Section deleted'); invalidate(); },
    onError: () => { toastError('Failed to delete section.'); },
  });

  const nextPosition = sections.length > 0 ? Math.max(...sections.map((s) => s.position)) + 1 : 0;

  function duplicateSection(section: SectionResponse) {
    addMut.mutate({
      sectionType: section.sectionType,
      position: nextPosition,
      content: { ...section.content },
      visible: section.visible,
    });
  }

  function moveSection(section: SectionResponse, direction: -1 | 1) {
    updateMut.mutate({
      id: section.id,
      req: {
        sectionType: section.sectionType,
        position: Math.max(0, section.position + direction),
        content: section.content,
        visible: section.visible,
      },
    });
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className={`mx-auto w-full transition-all ${PREVIEW_WIDTH[previewMode]}`}>
        {sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-slate-900">This page is empty.</p>
            <p className="mt-1 text-sm text-slate-500">Add a hero, admissions block, gallery, notice board, or contact section.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((section, index) => (
                <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  {editingSection?.id === section.id ? (
                    <SectionEditor
                      initial={section}
                      nextPosition={nextPosition}
                      onSave={(req) => updateMut.mutate({ id: section.id, req })}
                      onCancel={() => setEditingSection(null)}
                      isSaving={updateMut.isPending}
                    />
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                      <SectionMiniPreview section={section} />
                      <div className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                              {section.sectionType}
                            </span>
                            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                              #{index + 1}
                            </span>
                            {!section.visible && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">Hidden</span>
                            )}
                          </div>
                          <p className="mt-3 text-xs text-slate-500">Position {section.position}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => setEditingSection(section)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">Edit</button>
                          <button onClick={() => duplicateSection(section)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">Duplicate</button>
                          <button onClick={() => moveSection(section, -1)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">Move Up</button>
                          <button onClick={() => moveSection(section, 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">Move Down</button>
                          <button
                            onClick={() => updateMut.mutate({
                              id: section.id,
                              req: { sectionType: section.sectionType, position: section.position, content: section.content, visible: !section.visible },
                            })}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                          >
                            {section.visible ? 'Hide' : 'Show'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this section?')) deleteMut.mutate(section.id);
                            }}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {addingSection ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <SectionEditor
            nextPosition={nextPosition}
            onSave={(req) => addMut.mutate(req)}
            onCancel={() => setAddingSection(false)}
            isSaving={addMut.isPending}
          />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {SECTION_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.label}
              onClick={() => canUse(preset.plan)
                ? addMut.mutate({ sectionType: preset.type, position: nextPosition, content: preset.content, visible: true })
                : toastError(`Upgrade to ${PLAN_FEATURES[preset.plan].name} to unlock ${preset.label}.`)}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{preset.label}</p>
                {!canUse(preset.plan) && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Upgrade</span>}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{preset.description}</p>
            </button>
          ))}
          <button
            onClick={() => setAddingSection(true)}
            className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-left text-sm font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-700"
          >
            Advanced section editor
          </button>
        </div>
      )}
    </div>
  );
}

function PlanBadge({ plan }: { plan: PlanCode }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${PLAN_FEATURES[plan].badge}`}>
      {PLAN_FEATURES[plan].name}
    </span>
  );
}

function LockBadge({ plan }: { plan: PlanCode }) {
  if (canUse(plan)) return null;
  return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">Upgrade</span>;
}

function CmsPanel() {
  const { success, error: toastError } = useToast();
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const items = [
    ['Announcements', 'Publish urgent news, circulars, and parent alerts.', 'STARTER'],
    ['Events', 'Manage annual day, sports, exams, and registrations.', 'PROFESSIONAL'],
    ['Gallery', 'Curate campus, lab, sports, and achievement photos.', 'STARTER'],
    ['Faculty', 'Maintain educator profiles and department showcases.', 'PROFESSIONAL'],
    ['Admissions', 'Keep eligibility, forms, documents, and deadlines updated.', 'STARTER'],
    ['Downloads', 'Share PDFs, forms, calendars, and certificates securely.', 'PROFESSIONAL'],
  ] as const;

  function openCollection(title: string, plan: PlanCode) {
    if (!canUse(plan)) {
      toastError(`Upgrade to ${PLAN_FEATURES[plan].name} to manage ${title.toLowerCase()}.`);
      return;
    }
    setActiveCollection(title);
    success(`${title} workspace opened`);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map(([title, desc, plan]) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
              </div>
              <LockBadge plan={plan as PlanCode} />
            </div>
            <button
              type="button"
              onClick={() => openCollection(title, plan as PlanCode)}
              className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {canUse(plan as PlanCode) ? 'Manage Content' : `Upgrade to ${PLAN_FEATURES[plan as PlanCode].name}`}
            </button>
          </article>
        ))}
      </div>

      {activeCollection && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700">CMS Workspace</p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">{activeCollection}</h3>
              <p className="mt-1 text-sm text-slate-600">
                Use the Builder tab to add a matching section now. Persistent collection storage is queued in the backend CMS phase.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveCollection(null)}
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700"
            >
              Close
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export function WebsiteBuilderPage() {
  const { success, error: toastError } = useToast();
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? '';
  const qc = useQueryClient();
  const websiteEntitlement = useEntitlement({ feature: 'WEBSITE_BUILDER', requiredPlan: 'PROFESSIONAL' });
  const aiWebsiteEntitlement = useEntitlement({ feature: 'AI_WEBSITE_GENERATION', requiredPlan: 'AI_PREMIUM' });

  const [activeTab, setActiveTab] = useState<BuilderTab>('build');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [addingPage, setAddingPage] = useState(false);
  const [editingPage, setEditingPage] = useState<PageResponse | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

  const { data: adminMe } = useQuery({
    queryKey: ['school-admin-me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<{ tenantCode: string; schoolName: string }>>('/v1/school-admin/me');
      return data.data!;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const { data: website, isLoading: websiteLoading } = useQuery({
    queryKey: ['website', schoolId],
    queryFn: () => getWebsiteApi(schoolId),
    enabled: !!schoolId,
  });

  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ['website-pages', schoolId],
    queryFn: () => listPagesApi(schoolId),
    enabled: !!schoolId,
  });

  const { data: navItems = [] } = useQuery({
    queryKey: ['website-nav', schoolId],
    queryFn: () => listNavApi(schoolId),
    enabled: !!schoolId,
  });

  const { data: domains = [] } = useQuery({
    queryKey: ['custom-domains'],
    queryFn: listDomainsApi,
    enabled: !!user,
  });

  const websiteUrl = adminMe?.tenantCode ? `${window.location.origin}/sites/${adminMe.tenantCode}` : null;
  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? pages[0] ?? null;
  const publishedPages = pages.filter((p) => p.published).length;
  const verifiedDomain = domains.find((domain) => domain.status === 'VERIFIED');
  const seoReady = pages.length > 0 && pages.every((p) => p.seoTitle && p.seoDescription);
  const navReady = navItems.length > 0 || pages.length > 0;
  const launchScore = [publishedPages > 0, seoReady, navReady, !!verifiedDomain, website?.published].filter(Boolean).length * 20;

  const invalidatePages = () => qc.invalidateQueries({ queryKey: ['website-pages', schoolId] });
  const invalidateNav = () => qc.invalidateQueries({ queryKey: ['website-nav', schoolId] });

  const publishMut = useMutation({
    mutationFn: (published: boolean) => setPublishedApi(schoolId, published),
    onSuccess: (_data, published) => {
      success(published ? 'Website published' : 'Website unpublished');
      qc.invalidateQueries({ queryKey: ['website', schoolId] });
    },
    onError: () => { toastError('Failed to update publish status.'); },
  });

  const createPageMut = useMutation({
    mutationFn: (req: PageRequest) => createPageApi(schoolId, req),
    onSuccess: (page) => {
      success('Page created successfully');
      invalidatePages();
      setAddingPage(false);
      setSelectedPageId(page.id);
    },
    onError: () => { toastError('Failed to create page.'); },
  });

  const updatePageMut = useMutation({
    mutationFn: ({ id, req }: { id: string; req: PageRequest }) => updatePageApi(schoolId, id, req),
    onSuccess: () => { success('Page updated successfully'); invalidatePages(); setEditingPage(null); },
    onError: () => { toastError('Failed to update page.'); },
  });

  const deletePageMut = useMutation({
    mutationFn: (id: string) => deletePageApi(schoolId, id),
    onSuccess: () => {
      success('Page deleted');
      invalidatePages();
      setSelectedPageId(null);
    },
    onError: () => { toastError('Failed to delete page.'); },
  });

  const createTemplateMut = useMutation({
    mutationFn: async (template: WebsiteTemplate) => {
      if (!canUse(template.plan)) throw new Error(`Upgrade to ${PLAN_FEATURES[template.plan].name} to unlock this template.`);
      const existingSlugs = new Set(pages.map((p) => p.slug));
      for (const [index, templatePage] of template.pages.entries()) {
        const baseSlug = templatePage.slug;
        const slug = existingSlugs.has(baseSlug) ? `${baseSlug}-${Date.now().toString().slice(-4)}-${index}` : baseSlug;
        const page = await createPageApi(schoolId, {
          title: templatePage.title,
          slug,
          seoTitle: `${templatePage.title} | ${adminMe?.schoolName ?? 'School Website'}`,
          seoDescription: `${templatePage.title} information for ${adminMe?.schoolName ?? 'the school'}.`,
          published: false,
          displayOrder: pages.length + index,
        });
        for (const [sectionIndex, section] of templatePage.sections.entries()) {
          await addSectionApi(schoolId, page.id, {
            sectionType: section.type,
            position: sectionIndex,
            content: section.content,
            visible: true,
          });
        }
        if (index < 5) {
          await addNavItemApi(schoolId, {
            label: templatePage.title,
            pageId: page.id,
            position: navItems.length + index,
          });
        }
      }
    },
    onSuccess: () => {
      success('Template installed as draft pages');
      invalidatePages();
      invalidateNav();
      setActiveTab('build');
    },
    onError: (err: unknown) => {
      toastError(err instanceof Error ? err.message : 'Failed to install template.');
    },
  });

  const aiGenerateMut = useMutation({
    mutationFn: async () => {
      if (!PLAN_FEATURES[CURRENT_PLAN].ai) throw new Error('Upgrade to Professional to unlock AI website generation.');
      const schoolName = adminMe?.schoolName ?? 'Your School';
      const prompt = aiPrompt.trim() || 'balanced academics, admissions, achievements, parent trust, and campus life';
      const page = await createPageApi(schoolId, {
        title: 'AI Generated Landing',
        slug: `ai-generated-${Date.now().toString().slice(-5)}`,
        seoTitle: `${schoolName} | Admissions, Academics and Campus Life`,
        seoDescription: `${schoolName} website generated with AI guidance for ${prompt}.`,
        published: false,
        displayOrder: pages.length,
      });
      const generatedSections: SectionRequest[] = [
        {
          sectionType: 'HERO',
          position: 0,
          visible: true,
          content: {
            badge: 'AI Recommended',
            heading: `${schoolName} - future-ready education`,
            subheading: `A polished school website draft focused on ${prompt}.`,
            ctaText: 'Book a Campus Visit',
            ctaUrl: '#contact',
            highlights: ['Academics', 'Admissions', 'Activities'],
          },
        },
        {
          sectionType: SECTION_PRESETS[1].type,
          position: 1,
          visible: true,
          content: SECTION_PRESETS[1].content,
        },
        {
          sectionType: SECTION_PRESETS[3].type,
          position: 2,
          visible: true,
          content: SECTION_PRESETS[3].content,
        },
        {
          sectionType: SECTION_PRESETS[8].type,
          position: 3,
          visible: true,
          content: SECTION_PRESETS[8].content,
        },
      ];
      for (const section of generatedSections) {
        await addSectionApi(schoolId, page.id, section);
      }
      return page.id;
    },
    onSuccess: (pageId) => {
      success('AI draft generated');
      invalidatePages();
      setSelectedPageId(pageId);
      setActiveTab('build');
    },
    onError: (err: unknown) => {
      toastError(err instanceof Error ? err.message : 'AI generation failed.');
    },
  });

  const readinessItems = useMemo(() => [
    { label: 'Published page', done: publishedPages > 0, action: 'Publish at least one page.' },
    { label: 'SEO coverage', done: seoReady, action: 'Add title and description to every page.' },
    { label: 'Navigation', done: navReady, action: 'Use pages or navigation items for menu links.' },
    { label: 'Custom domain', done: !!verifiedDomain, action: 'Verify a custom domain when plan allows it.' },
    { label: 'Website switch', done: !!website?.published, action: 'Turn on website publishing.' },
  ], [publishedPages, seoReady, navReady, verifiedDomain, website?.published]);

  if (websiteLoading || pagesLoading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-slate-950">{adminMe?.schoolName ?? 'Website Builder'}</h1>
              <PlanBadge plan={CURRENT_PLAN} />
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${website?.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                {website?.published ? 'Website Live' : 'Draft Mode'}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">No-code website studio for pages, templates, CMS, launch readiness, AI, and monetization.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {websiteUrl && website?.published && (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                Preview Site
              </a>
            )}
            {websiteUrl && !website?.published && (
              <button
                type="button"
                onClick={() => toastError('Publish the website first to open the public URL. You can preview drafts inside the builder canvas.')}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                Preview Locked
              </button>
            )}
            <button
              disabled={publishMut.isPending}
              onClick={() => publishMut.mutate(!(website?.published ?? false))}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${website?.published ? 'bg-slate-800 hover:bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {publishMut.isPending ? 'Saving...' : website?.published ? 'Unpublish' : 'Publish Website'}
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-74px)] lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-3">
          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-lg font-bold text-slate-950">{pages.length}</p>
              <p className="text-xs text-slate-500">Pages</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-lg font-bold text-slate-950">{publishedPages}</p>
              <p className="text-xs text-slate-500">Live</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-lg font-bold text-slate-950">{launchScore}%</p>
              <p className="text-xs text-slate-500">Ready</p>
            </div>
          </div>

          <nav className="mb-4 grid grid-cols-2 gap-2">
            {([
              ['build', 'Builder'],
              ['templates', 'Templates'],
              ['cms', 'CMS'],
              ['ai', 'AI'],
              ['launch', 'Launch'],
              ['analytics', 'Analytics'],
            ] as Array<[BuilderTab, string]>).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${activeTab === key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pages</p>
            <button
              onClick={() => { setAddingPage(true); setEditingPage(null); setActiveTab('build'); }}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              New
            </button>
          </div>
          <div className="space-y-1">
            {pages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Choose a template or create your first page.
              </div>
            ) : pages.map((page) => (
              <button
                key={page.id}
                onClick={() => { setSelectedPageId(page.id); setAddingPage(false); setEditingPage(null); setActiveTab('build'); }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${selectedPage?.id === page.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span className="truncate font-semibold">{page.title}</span>
                <span className={`text-xs ${page.published ? 'text-emerald-600' : 'text-slate-400'}`}>{page.published ? 'live' : 'draft'}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 p-4 lg:p-6">
          {!websiteEntitlement.allowed && (
            <div className="mb-5">
              <LockedFeature
                title="Website Builder belongs in Professional"
                description="Keep basic website access for trials, then upsell premium templates, custom branding, custom domains, lead capture, and analytics through the Professional plan."
                requiredPlan="PROFESSIONAL"
              />
            </div>
          )}

          {activeTab === 'build' && (
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Visual Builder</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">
                      {addingPage ? 'Create a new page' : selectedPage ? selectedPage.title : 'Launch your school website'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedPage ? `/${selectedPage.slug}` : 'Start with a template, AI draft, or a blank page.'}
                    </p>
                  </div>
                  <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {(['desktop', 'tablet', 'mobile'] as PreviewMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setPreviewMode(mode)}
                        className={`rounded-md px-3 py-1.5 text-xs font-bold capitalize ${previewMode === mode ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {addingPage ? (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <PageForm
                      defaultOrder={pages.length}
                      onSave={(req) => createPageMut.mutate(req)}
                      onCancel={() => setAddingPage(false)}
                      isSaving={createPageMut.isPending}
                    />
                  </div>
                ) : selectedPage ? (
                  <div className="mt-5 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setEditingPage(selectedPage)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Page Settings</button>
                        <button
                          onClick={() => updatePageMut.mutate({
                            id: selectedPage.id,
                            req: { ...selectedPage, seoTitle: selectedPage.seoTitle ?? undefined, seoDescription: selectedPage.seoDescription ?? undefined, published: !selectedPage.published },
                          })}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {selectedPage.published ? 'Unpublish Page' : 'Publish Page'}
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete page "${selectedPage.title}" and all sections?`)) deletePageMut.mutate(selectedPage.id);
                        }}
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete Page
                      </button>
                    </div>
                    {editingPage?.id === selectedPage.id && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <PageForm
                          initial={selectedPage}
                          defaultOrder={selectedPage.displayOrder}
                          onSave={(req) => updatePageMut.mutate({ id: selectedPage.id, req })}
                          onCancel={() => setEditingPage(null)}
                          isSaving={updatePageMut.isPending}
                        />
                      </div>
                    )}
                    <SectionsPanel schoolId={schoolId} page={selectedPage} previewMode={previewMode} />
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <button onClick={() => setActiveTab('templates')} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left hover:border-blue-300">
                      <p className="text-sm font-bold text-slate-950">Choose a template</p>
                      <p className="mt-2 text-sm text-slate-500">Install a complete school website draft.</p>
                    </button>
                    <button onClick={() => setActiveTab('ai')} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left hover:border-blue-300">
                      <p className="text-sm font-bold text-slate-950">Generate with AI</p>
                      <p className="mt-2 text-sm text-slate-500">Create homepage copy, SEO, and sections.</p>
                    </button>
                    <button onClick={() => setAddingPage(true)} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left hover:border-blue-300">
                      <p className="text-sm font-bold text-slate-950">Start blank</p>
                      <p className="mt-2 text-sm text-slate-500">Create a page and add sections visually.</p>
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'templates' && (
            <section className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Template Marketplace</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">Professional school website templates</h2>
                <p className="mt-1 text-sm text-slate-500">Templates create real draft pages and sections through the existing Website Builder APIs.</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {WEBSITE_TEMPLATES.map((template) => (
                  <article key={template.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className={`h-28 bg-gradient-to-br ${template.accent}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-slate-950">{template.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{template.category}</p>
                        </div>
                        <LockBadge plan={template.plan} />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {template.pages.map((page) => (
                          <span key={page.slug} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{page.title}</span>
                        ))}
                      </div>
                      <button
                        onClick={() => createTemplateMut.mutate(template)}
                        disabled={createTemplateMut.isPending}
                        className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        {createTemplateMut.isPending ? 'Installing...' : canUse(template.plan) ? 'Use Template' : `Upgrade to ${PLAN_FEATURES[template.plan].name}`}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'cms' && (
            <section className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">CMS Hub</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">Manage content without touching pages</h2>
                <p className="mt-1 text-sm text-slate-500">CMS collections are staged as a product surface now; normalized backend storage comes in the next backend slice.</p>
              </div>
              <CmsPanel />
            </section>
          )}

          {activeTab === 'ai' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">AI Website Generation</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">Generate a premium school website draft</h2>
                  <p className="mt-1 text-sm text-slate-500">This creates draft pages and sections using the current APIs. AI provider integration can replace the deterministic draft generator later.</p>
                </div>
                {!aiWebsiteEntitlement.allowed && <LockBadge plan="AI_PREMIUM" />}
              </div>
              {!aiWebsiteEntitlement.allowed && (
                <div className="mt-4">
                  <LockedFeature
                    title="AI website generation is a premium add-on"
                    description="Manual templates remain available, while AI copy, SEO guidance, and generated sections become an AI Premium upgrade path."
                    requiredPlan="AI_PREMIUM"
                    compact
                  />
                </div>
              )}
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={5}
                placeholder="Example: international school in Lucknow with robotics lab, sports academy, scholarship program, and admissions focus"
                className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {['Weak SEO rewritten automatically', 'Admission-focused hero copy', 'Parent trust and campus highlights'].map((item) => (
                  <div key={item} className="rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">{item}</div>
                ))}
              </div>
              <button
                onClick={() => aiGenerateMut.mutate()}
                disabled={aiGenerateMut.isPending || !aiWebsiteEntitlement.allowed}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {aiGenerateMut.isPending ? 'Generating...' : aiWebsiteEntitlement.allowed ? 'Generate AI Draft' : 'Upgrade to Generate'}
              </button>
            </section>
          )}

          {activeTab === 'launch' && (
            <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Launch Checklist</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">Website readiness: {launchScore}%</h2>
                <div className="mt-5 space-y-3">
                  {readinessItems.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.action}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.done ? 'Ready' : 'Needs work'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-950">Domain and plan</p>
                <p className="mt-2 text-sm text-slate-500">{verifiedDomain ? `Verified domain: ${verifiedDomain.domain}` : 'No verified custom domain yet.'}</p>
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <PlanBadge plan={CURRENT_PLAN} />
                  <p className="mt-3 text-sm text-slate-600">{PLAN_FEATURES[CURRENT_PLAN].pages}</p>
                  <p className="mt-1 text-sm text-slate-600">{PLAN_FEATURES[CURRENT_PLAN].templates}</p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'analytics' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Website Analytics</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">Traffic, leads, SEO, and conversion insights</h2>
                  <p className="mt-1 text-sm text-slate-500">Analytics UI is plan-aware and ready for event tracking APIs.</p>
                </div>
                <LockBadge plan="PROFESSIONAL" />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                {[
                  ['Visitors', 'Traffic tracking is queued for the analytics event API.'],
                  ['Leads', 'Lead capture will activate when inquiry forms are connected.'],
                  ['SEO score', seoReady ? 'SEO coverage is strong.' : 'Add SEO title and description to every page.'],
                  ['Top page', pages[0] ? `${pages[0].title} is first in your navigation order.` : 'Create your first page.'],
                ].map(([label, message]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => label === 'SEO score' ? setActiveTab('launch') : toastError(message)}
                    className="rounded-xl bg-slate-50 p-4 text-left hover:bg-slate-100"
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="mt-2 text-lg font-bold text-slate-950">
                      {label === 'Visitors' ? 'Coming soon' : label === 'Leads' ? 'Inquiry tracking' : label === 'SEO score' ? `${seoReady ? 90 : 45}%` : pages[0]?.title ?? 'No pages'}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
