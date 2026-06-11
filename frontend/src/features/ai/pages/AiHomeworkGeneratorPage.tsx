import { FormEvent, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { demoAssistantResponse } from "../aiConfig";
import { AiGeneratedOutput } from "../components/AiGeneratedOutput";
import { AiPageHeader } from "../components/AiPageHeader";
import { generateHomework } from "../services/aiApi";
import type { AiAssistantResponse, AiHomeworkGenerationRequest } from "../types/ai.types";

const initialForm: AiHomeworkGenerationRequest = {
  className: "Class VI",
  section: "A",
  subject: "Mathematics",
  chapter: "Fractions",
  difficulty: "Medium",
  studentLevel: "Mixed",
  instructions: "Create a short assignment with practice and one thinking question."
};

export function AiHomeworkGeneratorPage() {
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
          ? await generateHomework(accessToken, form)
          : demoAssistantResponse(role, `Generate homework for ${form.className} ${form.subject} on ${form.chapter}`);
      setResponse(nextResponse);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to generate homework.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <AiPageHeader title="Homework generator" description="Create teacher-reviewed homework drafts with class, subject, and difficulty context." />
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
              <span>Class</span>
              <input value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} required />
            </label>
            <label className="field">
              <span>Section</span>
              <input value={form.section || ""} onChange={(event) => setForm({ ...form, section: event.target.value })} />
            </label>
          </div>
          <div className="two-column">
            <label className="field">
              <span>Subject</span>
              <input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required />
            </label>
            <label className="field">
              <span>Chapter</span>
              <input value={form.chapter} onChange={(event) => setForm({ ...form, chapter: event.target.value })} required />
            </label>
          </div>
          <div className="two-column">
            <label className="field">
              <span>Difficulty</span>
              <input value={form.difficulty || ""} onChange={(event) => setForm({ ...form, difficulty: event.target.value })} />
            </label>
            <label className="field">
              <span>Student level</span>
              <input value={form.studentLevel || ""} onChange={(event) => setForm({ ...form, studentLevel: event.target.value })} />
            </label>
          </div>
          <label className="field">
            <span>Instructions</span>
            <textarea value={form.instructions || ""} onChange={(event) => setForm({ ...form, instructions: event.target.value })} rows={5} />
          </label>
          <button className="primary-button" type="submit" disabled={loading || !form.className || !form.subject || !form.chapter}>
            Generate homework
          </button>
          {useMessage ? <div className="pending-label">{useMessage}</div> : null}
        </form>
        <AiGeneratedOutput
          title="Homework draft"
          response={response}
          loading={loading}
          error={error}
          onRegenerate={() => void submit()}
          onUse={() => setUseMessage("Draft marked for teacher review. Persisting homework will use the existing homework APIs in a later phase.")}
        />
      </div>
    </div>
  );
}
