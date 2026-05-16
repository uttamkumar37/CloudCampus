import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTenants } from '../api/tenantApi';
import {
  ingestDocument,
  listDocuments,
  deleteDocument,
  ragQuery,
  type KnowledgeDocument,
  type RagQueryResponse,
} from '../api/knowledgeApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-IN');
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {children}
    </div>
  );
}

// ── Document list ─────────────────────────────────────────────────────────────

function DocList({
  tenantId,
  docs,
  onDeleted,
}: {
  tenantId: string;
  docs: KnowledgeDocument[];
  onDeleted: () => void;
}) {
  const deleteMutation = useMutation({
    mutationFn: (docId: string) => deleteDocument(tenantId, docId),
    onSuccess: onDeleted,
  });

  if (docs.length === 0) {
    return <p className="text-sm text-gray-400">No documents ingested yet.</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {docs.map((d) => (
        <div key={d.id} className="flex items-start justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{d.title}</p>
            <p className="text-xs text-gray-400">
              {fmt(d.charCount)} chars · {d.chunkCount} chunks ·{' '}
              {new Date(d.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={() => deleteMutation.mutate(d.id)}
            disabled={deleteMutation.isPending}
            className="shrink-0 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Ingest form ───────────────────────────────────────────────────────────────

function IngestForm({ tenantId, onIngested }: { tenantId: string; onIngested: () => void }) {
  const [title,   setTitle]   = useState('');
  const [content, setContent] = useState('');

  const mutation = useMutation({
    mutationFn: () => ingestDocument(tenantId, title.trim(), content.trim()),
    onSuccess: () => {
      setTitle('');
      setContent('');
      onIngested();
    },
  });

  const canSubmit = title.trim().length > 0 && content.trim().length > 10;

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Document title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. School Fee Policy 2025-26"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Content <span className="text-gray-400">(plain text, up to 200 000 chars)</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Paste document content here…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{fmt(content.length)} chars</p>
      </div>
      {mutation.isError && (
        <p className="text-xs text-red-600">Ingestion failed. Please try again.</p>
      )}
      {mutation.isSuccess && (
        <p className="text-xs text-green-600">Document ingested successfully.</p>
      )}
      <button
        onClick={() => mutation.mutate()}
        disabled={!canSubmit || mutation.isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {mutation.isPending ? 'Ingesting…' : 'Ingest Document'}
      </button>
    </div>
  );
}

// ── RAG query panel ───────────────────────────────────────────────────────────

function QueryPanel({ tenantId }: { tenantId: string }) {
  const [question, setQuestion] = useState('');
  const [result,   setResult]   = useState<RagQueryResponse | null>(null);

  const mutation = useMutation({
    mutationFn: () => ragQuery(tenantId, question.trim()),
    onSuccess: (data) => setResult(data),
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && question.trim() && mutation.mutate()}
          placeholder="Ask a question answered by your knowledge base…"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => mutation.mutate()}
          disabled={!question.trim() || mutation.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Thinking…' : 'Ask'}
        </button>
      </div>

      {mutation.isError && (
        <p className="text-xs text-red-600">Query failed. Please try again.</p>
      )}

      {result && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 space-y-2">
          <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{result.answer}</p>
          <p className="text-xs text-indigo-500">
            Based on {result.chunksUsed} chunk{result.chunksUsed !== 1 ? 's' : ''} from the knowledge base.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function KnowledgeBasePage() {
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const queryClient = useQueryClient();

  const { data: tenantsPage, isLoading: tenantsLoading } = useQuery({
    queryKey: ['tenants-all'],
    queryFn:  () => listTenants(0, 200),
  });

  const tenants = tenantsPage?.items ?? [];

  const { data: docs = [], isLoading: docsLoading } = useQuery({
    queryKey: ['knowledge-docs', selectedTenantId],
    queryFn:  () => listDocuments(selectedTenantId),
    enabled:  !!selectedTenantId,
  });

  function invalidateDocs() {
    queryClient.invalidateQueries({ queryKey: ['knowledge-docs', selectedTenantId] });
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Knowledge Base</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Ingest documents per tenant and run RAG queries against the vector store.
        </p>
      </div>

      {/* Tenant selector */}
      <Section title="Select Tenant">
        {tenantsLoading ? (
          <p className="text-sm text-gray-400">Loading tenants…</p>
        ) : (
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full max-w-md rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— choose a tenant —</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
        )}
      </Section>

      {selectedTenantId && (
        <>
          {/* Document list */}
          <Section title={`Indexed Documents (${docs.length})`}>
            {docsLoading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : (
              <DocList tenantId={selectedTenantId} docs={docs} onDeleted={invalidateDocs} />
            )}
          </Section>

          {/* Ingest */}
          <Section title="Ingest New Document">
            <IngestForm tenantId={selectedTenantId} onIngested={invalidateDocs} />
          </Section>

          {/* RAG query */}
          <Section title="RAG Query Playground">
            <QueryPanel tenantId={selectedTenantId} />
          </Section>
        </>
      )}
    </div>
  );
}
