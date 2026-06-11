import { FormEvent, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { demoAssistantResponse } from "../aiConfig";
import { AiGeneratedOutput } from "../components/AiGeneratedOutput";
import { AiPageHeader } from "../components/AiPageHeader";
import { generateNotice } from "../services/aiApi";
import type { AiAssistantResponse, AiNoticeGenerationRequest } from "../types/ai.types";

const initialForm: AiNoticeGenerationRequest = {
  topic: "Parent meeting for attendance improvement",
  audience: "Parents of Class VI",
  channel: "Notice",
  tone: "Warm and clear",
  language: "English",
  details: "Invite parents for a short meeting this Friday after school."
};

export function AiNoticeGeneratorPage() {
  const { accessToken, role } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [response, setResponse] = useState<AiAssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMessage, setUseMessage] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    setUseMessage(null);
    try {
      const nextResponse =
        accessToken && role !== "GUEST"
          ? await generateNotice(accessToken, form)
          : demoAssistantResponse(role, `Draft a ${form.channel || "notice"} about ${form.topic}`);
      setResponse(nextResponse);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to generate notice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <AiPageHeader title="Notice generator" description="Draft school notices, parent messages, email, or SMS copy for staff review." />
      <div className="generator-layout">
        <form
          className="form-panel"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void submit();
          }}
        >
          <label className="field">
            <span>Topic</span>
            <input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} required />
          </label>
          <div className="two-column">
            <label className="field">
              <span>Audience</span>
              <input value={form.audience || ""} onChange={(event) => setForm({ ...form, audience: event.target.value })} />
            </label>
            <label className="field">
              <span>Channel</span>
              <select value={form.channel || ""} onChange={(event) => setForm({ ...form, channel: event.target.value })}>
                <option value="Notice">Notice</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="Parent message">Parent message</option>
              </select>
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
            <span>Details</span>
            <textarea value={form.details || ""} onChange={(event) => setForm({ ...form, details: event.target.value })} rows={5} />
          </label>
          <button className="primary-button" type="submit" disabled={loading || !form.topic.trim()}>
            Generate notice
          </button>
          {useMessage ? <div className="pending-label">{useMessage}</div> : null}
        </form>
        <AiGeneratedOutput
          title="Notice draft"
          response={response}
          loading={loading}
          error={error}
          onRegenerate={() => void submit()}
          onUse={() => setUseMessage("Draft marked for review. Publishing flow will use the existing notice APIs in a later phase.")}
        />
      </div>
    </div>
  );
}
