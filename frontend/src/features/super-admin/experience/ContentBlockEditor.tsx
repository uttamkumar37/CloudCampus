import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/axiosInstance';

interface ContentBlock {
  id: string;
  blockKey: string;
  blockType: string;
  content: Record<string, unknown>;
  locale: string;
  version: number;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

const SA_BASE = '/v1/super-admin/experience';

async function fetchBlocks(): Promise<ContentBlock[]> {
  const res = await api.get<{ data: ContentBlock[] }>(`${SA_BASE}/content-blocks`);
  return res.data.data;
}

async function publishBlock(id: string): Promise<ContentBlock> {
  const res = await api.post<{ data: ContentBlock }>(`${SA_BASE}/content-blocks/${id}/publish`);
  return res.data.data;
}

async function saveBlock(block: Partial<ContentBlock>): Promise<ContentBlock> {
  if (block.id) {
    const res = await api.put<{ data: ContentBlock }>(`${SA_BASE}/content-blocks/${block.id}`, block);
    return res.data.data;
  }
  const res = await api.post<{ data: ContentBlock }>(`${SA_BASE}/content-blocks`, block);
  return res.data.data;
}

export default function ContentBlockEditor() {
  const qc = useQueryClient();
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['sa:exp:blocks'],
    queryFn: fetchBlocks,
  });

  const { mutate: doPublish } = useMutation({
    mutationFn: publishBlock,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa:exp:blocks'] }),
  });

  const [search, setSearch] = useState('');
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);

  const filtered = blocks.filter((b) =>
    b.blockKey.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Blocks</h2>
          <p className="text-sm text-gray-400 mt-0.5">{blocks.length} blocks total</p>
        </div>
        <button
          onClick={() =>
            setEditingBlock({
              id: '', blockKey: '', blockType: 'TEXT', content: { value: '' },
              locale: 'en', version: 1, published: false, publishedAt: null,
              updatedAt: new Date().toISOString(),
            })
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + New Block
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by block key…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="text-gray-400 text-center py-10 text-sm">No content blocks found.</p>
          ) : (
            filtered.map((block) => (
              <div key={block.id} className="flex items-center px-5 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 font-mono text-sm">{block.blockKey}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {block.blockType} · locale:{block.locale} · v{block.version}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    block.published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {block.published ? 'Live' : 'Draft'}
                </span>
                <button
                  onClick={() => setEditingBlock(block)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                {!block.published && block.id && (
                  <button
                    onClick={() => doPublish(block.id)}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Publish
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {editingBlock && (
        <BlockEditModal
          block={editingBlock}
          onClose={() => setEditingBlock(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['sa:exp:blocks'] });
            setEditingBlock(null);
          }}
        />
      )}
    </div>
  );
}

function BlockEditModal({
  block,
  onClose,
  onSaved,
}: {
  block: ContentBlock;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [blockKey, setBlockKey] = useState(block.blockKey);
  const [blockType, setBlockType] = useState(block.blockType);
  const [locale, setLocale] = useState(block.locale);
  const [contentRaw, setContentRaw] = useState(JSON.stringify(block.content, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(contentRaw);
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON');
      return;
    }
    setSaving(true);
    try {
      await saveBlock({ id: block.id, blockKey, blockType, locale, content: parsed as Record<string, unknown> });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {block.id ? 'Edit Block' : 'New Content Block'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Block Key</label>
              <input
                value={blockKey}
                onChange={(e) => setBlockKey(e.target.value)}
                placeholder="hero.headline"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select
                value={blockType}
                onChange={(e) => setBlockType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['TEXT', 'HTML', 'NUMBER', 'JSON', 'MEDIA_REF'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Locale</label>
            <input
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              placeholder="en"
              className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Content (JSON)</label>
            <textarea
              value={contentRaw}
              onChange={(e) => setContentRaw(e.target.value)}
              rows={10}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Block'}
          </button>
        </div>
      </div>
    </div>
  );
}
