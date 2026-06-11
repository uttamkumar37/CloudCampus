import { FormEvent, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { demoAssistantResponse } from "../aiConfig";
import { AiGeneratedOutput } from "../components/AiGeneratedOutput";
import { AiPageHeader } from "../components/AiPageHeader";
import { summarizeReport } from "../services/aiApi";
import type { AiAssistantResponse, AiReportSummaryRequest } from "../types/ai.types";

const initialForm: AiReportSummaryRequest = {
  reportType: "Attendance risk report",
  reportScope: "Class VI, this week",
  tone: "Plain language",
  language: "English",
  reportText:
    "Class VI attendance is 87%. Four students are below 75% for the week. Two students have repeated Monday absences. Parent follow-up is recommended.",
};

export function AiReportSummaryPage() {
  const { accessToken, role } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [response, setResponse] = useState<AiAssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const nextResponse =
        accessToken && role !== "GUEST"
          ? await summarizeReport(accessToken, form)
          : demoAssistantResponse(role, `Summarize ${form.reportType}: ${form.reportText.slice(0, 160)}`);
      setResponse(nextResponse);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to summarize report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <AiPageHeader title="Report summary" description="Turn dense school reports into highlights, risks, and recommended next actions." />
      <div className="generator-layout">
        <form
          className="form-panel"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="two-column">
            <label className="field">
              <span>Report type</span>
              <input value={form.reportType} onChange={(event) => setForm({ ...form, reportType: event.target.value })} required />
            </label>
            <label className="field">
              <span>Scope</span>
              <input value={form.reportScope || ""} onChange={(event) => setForm({ ...form, reportScope: event.target.value })} />
            </label>
          </div>
          <div className="two-column">
            <label className="field">
              <span>Tone</span>
              <input value={form.tone || ""} onChange={(event) => setForm({ ...form, tone: event.target.value })} />
            </label>
            <label className="field">
              <span>Language</span>
              <input value={form.language || ""} onChange={(event) => setForm({ ...form, language: event.target.value })} />
            </label>
          </div>
          <label className="field">
            <span>Report text</span>
            <textarea value={form.reportText} onChange={(event) => setForm({ ...form, reportText: event.target.value })} rows={9} required />
          </label>
          <button className="primary-button" type="submit" disabled={loading || !form.reportType || !form.reportText}>
            Summarize report
          </button>
        </form>
        <AiGeneratedOutput title="Report explanation" response={response} loading={loading} error={error} onRegenerate={() => void submit()} />
      </div>
    </div>
  );
}
