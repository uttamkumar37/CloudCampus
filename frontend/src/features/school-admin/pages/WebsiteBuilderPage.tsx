import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
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
  type PageResponse,
  type PageRequest,
  type SectionResponse,
  type SectionRequest,
} from '../api/websiteApi';

// ── Section types ─────────────────────────────────────────────────────────────

const SECTION_TYPES = ['HERO', 'TEXT', 'IMAGE', 'GALLERY', 'CONTACT', 'CUSTOM'] as const;

// ── Page Form ─────────────────────────────────────────────────────────────────

interface PageFormProps {
  initial?: PageResponse;
  onSave: (req: PageRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function PageForm({ initial, onSave, onCancel, isSaving }: PageFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? '');
  const [seoDesc, setSeoDesc] = useState(initial?.seoDescription ?? '');
  const [published, setPublished] = useState(initial?.published ?? false);
  const [displayOrder, setDisplayOrder] = useState(initial?.displayOrder ?? 0);

  function autoSlug(val: string) {
    return val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!initial) setSlug(autoSlug(val));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ title, slug, seoTitle: seoTitle || undefined, seoDescription: seoDesc || undefined, published, displayOrder });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          required
          pattern="[a-z0-9-]+"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Lowercase letters, numbers, and hyphens only.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">SEO Title</label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Display Order</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">SEO Description</label>
        <textarea
          value={seoDesc}
          onChange={(e) => setSeoDesc(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600"
        />
        Published
      </label>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save Page'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Section Form ──────────────────────────────────────────────────────────────

interface SectionFormProps {
  initial?: SectionResponse;
  nextPosition: number;
  onSave: (req: SectionRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function SectionForm({ initial, nextPosition, onSave, onCancel, isSaving }: SectionFormProps) {
  const [sectionType, setSectionType] = useState(initial?.sectionType ?? 'TEXT');
  const [position, setPosition] = useState(initial?.position ?? nextPosition);
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [contentJson, setContentJson] = useState(
    initial ? JSON.stringify(initial.content, null, 2) : '{\n  "text": ""\n}',
  );
  const [jsonError, setJsonError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const content = JSON.parse(contentJson);
      setJsonError('');
      onSave({ sectionType, position, content, visible });
    } catch {
      setJsonError('Invalid JSON');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Section Type</label>
          <select
            value={sectionType}
            onChange={(e) => setSectionType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SECTION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <input
            type="number"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Content (JSON)</label>
        <textarea
          value={contentJson}
          onChange={(e) => { setContentJson(e.target.value); setJsonError(''); }}
          rows={6}
          spellCheck={false}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {jsonError && <p className="mt-1 text-xs text-red-600">{jsonError}</p>}
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600"
        />
        Visible
      </label>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save Section'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Sections Panel ────────────────────────────────────────────────────────────

interface SectionsPanelProps {
  schoolId: string;
  page: PageResponse;
}

function SectionsPanel({ schoolId, page }: SectionsPanelProps) {
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
    onSuccess: () => { invalidate(); setAddingSection(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, req }: { id: string; req: SectionRequest }) =>
      updateSectionApi(schoolId, page.id, id, req),
    onSuccess: () => { invalidate(); setEditingSection(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSectionApi(schoolId, page.id, id),
    onSuccess: invalidate,
  });

  const nextPosition = sections.length > 0 ? Math.max(...sections.map((s) => s.position)) + 1 : 0;

  if (isLoading) return <p className="text-sm text-gray-500">Loading sections…</p>;

  return (
    <div className="space-y-3">
      {sections.map((s) => (
        <div key={s.id} className="rounded-lg border border-gray-200 bg-white p-4">
          {editingSection?.id === s.id ? (
            <SectionForm
              initial={s}
              nextPosition={nextPosition}
              onSave={(req) => updateMut.mutate({ id: s.id, req })}
              onCancel={() => setEditingSection(null)}
              isSaving={updateMut.isPending}
            />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {s.sectionType}
                  </span>
                  <span className="text-xs text-gray-500">pos {s.position}</span>
                  {!s.visible && (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">hidden</span>
                  )}
                </div>
                <pre className="mt-2 max-h-32 overflow-auto rounded bg-gray-50 p-2 text-xs text-gray-700">
                  {JSON.stringify(s.content, null, 2)}
                </pre>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setEditingSection(s)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this section?')) deleteMut.mutate(s.id);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {addingSection ? (
        <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50 p-4">
          <SectionForm
            nextPosition={nextPosition}
            onSave={(req) => addMut.mutate(req)}
            onCancel={() => setAddingSection(false)}
            isSaving={addMut.isPending}
          />
        </div>
      ) : (
        <button
          onClick={() => setAddingSection(true)}
          className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          + Add Section
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function WebsiteBuilderPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? '';
  const qc = useQueryClient();

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [addingPage, setAddingPage] = useState(false);
  const [editingPage, setEditingPage] = useState<PageResponse | null>(null);

  const { data: website } = useQuery({
    queryKey: ['website', schoolId],
    queryFn: () => getWebsiteApi(schoolId),
    enabled: !!schoolId,
  });

  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ['website-pages', schoolId],
    queryFn: () => listPagesApi(schoolId),
    enabled: !!schoolId,
  });

  const invalidatePages = () => qc.invalidateQueries({ queryKey: ['website-pages', schoolId] });

  const publishMut = useMutation({
    mutationFn: (published: boolean) => setPublishedApi(schoolId, published),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', schoolId] }),
  });

  const createPageMut = useMutation({
    mutationFn: (req: PageRequest) => createPageApi(schoolId, req),
    onSuccess: (page) => {
      invalidatePages();
      setAddingPage(false);
      setSelectedPageId(page.id);
    },
  });

  const updatePageMut = useMutation({
    mutationFn: ({ id, req }: { id: string; req: PageRequest }) =>
      updatePageApi(schoolId, id, req),
    onSuccess: () => { invalidatePages(); setEditingPage(null); },
  });

  const deletePageMut = useMutation({
    mutationFn: (id: string) => deletePageApi(schoolId, id),
    onSuccess: () => {
      invalidatePages();
      setSelectedPageId(null);
    },
  });

  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? null;

  return (
    <div className="flex h-full min-h-screen">
      {/* Left pane — page list */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">Pages</h2>
          <button
            onClick={() => { setAddingPage(true); setEditingPage(null); setSelectedPageId(null); }}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            + New Page
          </button>
        </div>

        {/* Publish toggle */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
          <span className="text-xs font-medium text-gray-600">Site published</span>
          <button
            disabled={publishMut.isPending}
            onClick={() => publishMut.mutate(!(website?.published ?? false))}
            className={[
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none disabled:opacity-50',
              website?.published ? 'bg-green-500' : 'bg-gray-300',
            ].join(' ')}
            aria-label="Toggle site publish"
          >
            <span
              className={[
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5',
                website?.published ? 'translate-x-4' : 'translate-x-0.5',
              ].join(' ')}
            />
          </button>
        </div>

        {pagesLoading ? (
          <p className="px-4 py-3 text-sm text-gray-400">Loading…</p>
        ) : (
          <nav className="flex-1 overflow-y-auto p-2">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedPageId(p.id); setAddingPage(false); setEditingPage(null); }}
                className={[
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  selectedPageId === p.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                <span className="truncate font-medium">{p.title}</span>
                <span className={['text-xs', p.published ? 'text-green-600' : 'text-gray-400'].join(' ')}>
                  {p.published ? 'live' : 'draft'}
                </span>
              </button>
            ))}
          </nav>
        )}
      </aside>

      {/* Right pane — editor */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {addingPage && (
          <div>
            <h2 className="mb-4 text-base font-semibold text-gray-800">New Page</h2>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <PageForm
                onSave={(req) => createPageMut.mutate(req)}
                onCancel={() => setAddingPage(false)}
                isSaving={createPageMut.isPending}
              />
            </div>
          </div>
        )}

        {!addingPage && selectedPage && (
          <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-800">{selectedPage.title}</h2>
                <p className="mt-0.5 text-sm text-gray-500">/{selectedPage.slug}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPage(selectedPage)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Edit Page
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete page "${selectedPage.title}" and all its sections?`)) {
                      deletePageMut.mutate(selectedPage.id);
                    }
                  }}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Page edit form */}
            {editingPage?.id === selectedPage.id && (
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">Edit Page Details</h3>
                <PageForm
                  initial={selectedPage}
                  onSave={(req) => updatePageMut.mutate({ id: selectedPage.id, req })}
                  onCancel={() => setEditingPage(null)}
                  isSaving={updatePageMut.isPending}
                />
              </div>
            )}

            {/* Sections */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Sections</h3>
              <SectionsPanel schoolId={schoolId} page={selectedPage} />
            </div>
          </div>
        )}

        {!addingPage && !selectedPage && (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-400">Select a page or create a new one.</p>
          </div>
        )}
      </main>
    </div>
  );
}
