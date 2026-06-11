import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { AiPageHeader } from "../components/AiPageHeader";
import { getAiAuditLogs } from "../services/aiApi";
import type { AiPortalAuditLog, PageResponse } from "../types/ai.types";

const emptyPage: PageResponse<AiPortalAuditLog> = {
  items: [],
  page: 0,
  size: 25,
  totalItems: 0,
  totalPages: 0
};

function formatDate(value?: string) {
  if (!value) {
    return "No timestamp";
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function AiAuditPage() {
  const { accessToken, role } = useAuth();
  const [page, setPage] = useState(0);
  const [logs, setLogs] = useState<PageResponse<AiPortalAuditLog>>(emptyPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(nextPage = page) {
    setLoading(true);
    setError(null);
    try {
      if (!accessToken || role === "GUEST") {
        setLogs(emptyPage);
        return;
      }
      setLogs(await getAiAuditLogs(accessToken, nextPage, 25));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load AI audit logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(page);
  }, [accessToken, page, role]);

  return (
    <div className="page-stack">
      <AiPageHeader
        title="AI audit logs"
        description="View safe AI usage metadata only. Raw prompts and generated responses are not exposed by this UI."
      >
        <button className="icon-button" type="button" onClick={() => void load()}>
          <RefreshCw size={16} aria-hidden="true" />
          <span>Refresh</span>
        </button>
      </AiPageHeader>

      {error ? <div className="inline-error">{error}</div> : null}

      {loading ? (
        <section className="audit-list">
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line" />
        </section>
      ) : logs.items.length === 0 ? (
        <div className="empty-state">
          <strong>No audit rows available.</strong>
          <span>Authorized AI requests will appear here as metadata after backend usage.</span>
        </div>
      ) : (
        <section className="audit-list">
          {logs.items.map((log) => (
            <article className="audit-row" key={log.id}>
              <div>
                <strong>{log.feature?.replaceAll("_", " ") || "AI request"}</strong>
                <span>{formatDate(log.createdAt)}</span>
              </div>
              <div>
                <span>{log.role?.replaceAll("_", " ") || "Role unknown"}</span>
                <span>{log.requestType || "request"}</span>
              </div>
              <div>
                <span className="status-pill">{log.status || "UNKNOWN"}</span>
                <span>{log.denialReason || "Safety result clear"}</span>
              </div>
              <div>
                <span>Prompt hash</span>
                <code>{log.promptSha256 || "not returned"}</code>
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="pagination">
        <button className="icon-button" type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0}>
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Previous</span>
        </button>
        <span>
          Page {logs.page + 1} of {Math.max(logs.totalPages, 1)}
        </span>
        <button
          className="icon-button"
          type="button"
          onClick={() => setPage((value) => value + 1)}
          disabled={logs.totalPages === 0 || logs.page + 1 >= logs.totalPages}
        >
          <span>Next</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
