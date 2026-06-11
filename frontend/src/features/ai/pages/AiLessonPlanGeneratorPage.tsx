import { FormEvent, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { demoAssistantResponse } from "../aiConfig";
import { AiGeneratedOutput } from "../components/AiGeneratedOutput";
import { AiPageHeader } from "../components/AiPageHeader";
import { generateLessonPlan } from "../services/aiApi";
import type { AiAssistantResponse, AiLessonPlanGenerationRequest } from "../types/ai.types";

const initialForm: AiLessonPlanGenerationRequest = {
  className: "Class VI",
  section: "A",
  subject: "Mathematics",
  chapter: "Fractions",
  difficulty: "Medium",
  boardType: "CBSE",
  studentLevel: "Mixed",
  durationMinutes: 40,
  instructions: "Include warm-up, concept explanation, activity, assessment, and homework."
};

export function AiLessonPlanGeneratorPage() {
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
          ? await generateLessonPlan(accessToken, form)
          : demoAssistantResponse(role, `Create a lesson plan for ${form.className} ${form.subject} on ${form.chapter}`);
      setResponse(nextResponse);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to generate lesson plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <AiPageHeader title="Lesson plan generator" description="Turn a chapter into a classroom-ready plan that teachers can adjust before use." />
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
              <span>Board</span>
              <input value={form.boardType || ""} onChange={(event) => setForm({ ...form, boardType: event.target.value })} />
            </label>
            <label className="field">
              <span>Duration</span>
              <input
                value={form.durationMinutes || 40}
                onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })}
                min={10}
                max={180}
                type="number"
              />
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
            Generate lesson plan
          </button>
          {useMessage ? <div className="pending-label">{useMessage}</div> : null}
        </form>
        <AiGeneratedOutput
          title="Lesson plan draft"
          response={response}
          loading={loading}
          error={error}
          onRegenerate={() => void submit()}
          onUse={() => setUseMessage("Draft marked for teacher review. Saving lesson-plan records needs a future backend persistence flow.")}
        />
      </div>
    </div>
  );
}
